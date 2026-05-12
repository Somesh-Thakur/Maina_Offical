// Maina Desktop App — Tauri v2
// Discord RPC via local HTTP server (port 7463) + System Tray + Media Keys
//
// HOW IT WORKS:
//   The web frontend (both in-app WebView AND the regular browser) POSTs
//   player state to http://127.0.0.1:7463/rpc.
//   This Rust server receives it and updates Discord Rich Presence.
//   This approach is 100% reliable — no Tauri IPC injection needed.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::io::Read;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

use discord_rich_presence::{
    activity::{Activity, ActivityType, Assets, Button, Timestamps},
    DiscordIpc, DiscordIpcClient,
};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

// ─────────────────────────────────────────────────────────────
//  Discord RPC State
// ─────────────────────────────────────────────────────────────

struct DiscordRpcState(Arc<Mutex<Option<DiscordIpcClient>>>);

fn try_connect_discord(client_opt: &mut Option<DiscordIpcClient>) {
    if client_opt.is_some() {
        return;
    }
    let app_id = "1503459571195445449";
    match DiscordIpcClient::new(app_id) {
        Ok(mut client) => {
            if client.connect().is_ok() {
                *client_opt = Some(client);
                println!("[Maina] ✓ Discord RPC connected");
            } else {
                eprintln!("[Maina] Discord is not running — RPC skipped");
            }
        }
        Err(e) => eprintln!("[Maina] Discord RPC init error: {e}"),
    }
}

fn truncate(s: &str, max_chars: usize) -> String {
    if s.chars().count() <= max_chars {
        s.to_string()
    } else {
        let mut t: String = s.chars().take(max_chars - 1).collect();
        t.push('…');
        t
    }
}

/// Core function — update Discord activity from any source (HTTP or Tauri IPC)
fn do_update_discord(
    guard: &mut Option<DiscordIpcClient>,
    title: &str,
    artist: &str,
    thumbnail_url: &str,
    duration_secs: u64,
    elapsed_secs: u64,
) {
    try_connect_discord(guard);

    if let Some(client) = guard.as_mut() {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;

        let start_ts = now - elapsed_secs as i64;
        let end_ts   = if duration_secs > 0 { start_ts + duration_secs as i64 } else { 0 };

        let title_str  = truncate(title, 128);
        let artist_str = truncate(artist, 128);

        let large_img = if thumbnail_url.is_empty() {
            "maina_logo".to_string()
        } else {
            thumbnail_url.to_string()
        };

        let mut timestamps = Timestamps::new().start(start_ts);
        if end_ts > 0 {
            timestamps = timestamps.end(end_ts);
        }

        let activity = Activity::new()
            .activity_type(ActivityType::Listening)
            .details(&title_str)
            .state(&artist_str)
            .assets(
                Assets::new()
                    .large_image(&large_img)
                    .large_text(&title_str),
            )
            .timestamps(timestamps)
            .buttons(vec![
                Button::new("Listen on Maina", "https://maina-offical.vercel.app"),
            ]);

        if let Err(e) = client.set_activity(activity) {
            eprintln!("[Maina] Discord RPC set_activity failed: {e}");
            let _ = client.close();
            *guard = None;
        }
    }
}

fn do_clear_discord(guard: &mut Option<DiscordIpcClient>) {
    if let Some(client) = guard.as_mut() {
        if let Err(e) = client.clear_activity() {
            eprintln!("[Maina] Discord RPC clear failed: {e}");
            let _ = client.close();
            *guard = None;
        }
    }
}

// ─────────────────────────────────────────────────────────────
//  Local HTTP RPC Server (port 7463)
//  Frontend POSTs JSON here — works from WebView AND browser
// ─────────────────────────────────────────────────────────────

fn start_rpc_http_server(state: Arc<Mutex<Option<DiscordIpcClient>>>) {
    std::thread::spawn(move || {
        let server = match tiny_http::Server::http("127.0.0.1:7463") {
            Ok(s) => {
                println!("[Maina] ✓ RPC HTTP server listening on http://127.0.0.1:7463");
                s
            }
            Err(e) => {
                eprintln!("[Maina] RPC server failed to bind: {e}");
                return;
            }
        };

        for mut request in server.incoming_requests() {
            // CORS preflight
            let cors_headers: Vec<tiny_http::Header> = vec![
                tiny_http::Header::from_bytes(
                    "Access-Control-Allow-Origin".as_bytes(),
                    "*".as_bytes(),
                ).unwrap(),
                tiny_http::Header::from_bytes(
                    "Access-Control-Allow-Methods".as_bytes(),
                    "POST, OPTIONS".as_bytes(),
                ).unwrap(),
                tiny_http::Header::from_bytes(
                    "Access-Control-Allow-Headers".as_bytes(),
                    "Content-Type".as_bytes(),
                ).unwrap(),
            ];

            if *request.method() == tiny_http::Method::Options {
                let resp = tiny_http::Response::empty(200)
                    .with_headers(cors_headers);
                let _ = request.respond(resp);
                continue;
            }

            // Read body
            let mut body = String::new();
            if request.as_reader().read_to_string(&mut body).is_err() {
                continue;
            }

            // Parse JSON
            if let Ok(data) = serde_json::from_str::<serde_json::Value>(&body) {
                let title        = data["title"].as_str().unwrap_or("").to_string();
                let artist       = data["artist"].as_str().unwrap_or("").to_string();
                let thumbnail    = data["thumbnailUrl"].as_str().unwrap_or("").to_string();
                let duration     = data["durationSecs"].as_u64().unwrap_or(0);
                let elapsed      = data["elapsedSecs"].as_u64().unwrap_or(0);
                let clear        = data["clear"].as_bool().unwrap_or(false);

                let mut guard = state.lock().unwrap();
                if clear || title.is_empty() {
                    do_clear_discord(&mut guard);
                } else {
                    do_update_discord(&mut guard, &title, &artist, &thumbnail, duration, elapsed);
                }
            }

            let resp = tiny_http::Response::empty(200).with_headers(cors_headers);
            let _ = request.respond(resp);
        }
    });
}

// ─────────────────────────────────────────────────────────────
//  Tauri Commands (kept for backwards compatibility)
// ─────────────────────────────────────────────────────────────

#[tauri::command]
fn update_discord_status(
    state: tauri::State<DiscordRpcState>,
    title: String,
    artist: String,
    thumbnail_url: String,
    duration_secs: u64,
    elapsed_secs: u64,
) {
    let mut guard = state.0.lock().unwrap();
    do_update_discord(&mut guard, &title, &artist, &thumbnail_url, duration_secs, elapsed_secs);
}

#[tauri::command]
fn clear_discord_status(state: tauri::State<DiscordRpcState>) {
    let mut guard = state.0.lock().unwrap();
    do_clear_discord(&mut guard);
}

// ─────────────────────────────────────────────────────────────
//  Helper: dispatch keyboard event into webview
// ─────────────────────────────────────────────────────────────

fn dispatch_key(app: &AppHandle, key: &str) {
    if let Some(win) = app.get_webview_window("main") {
        let js = format!(
            r#"window.dispatchEvent(new KeyboardEvent('keydown', {{key: '{key}', bubbles: true}}));"#
        );
        let _ = win.eval(&js);
    }
}

// ─────────────────────────────────────────────────────────────
//  Main Entry Point
// ─────────────────────────────────────────────────────────────

fn main() {
    let discord_arc = Arc::new(Mutex::new(None::<DiscordIpcClient>));
    let discord_state = DiscordRpcState(Arc::clone(&discord_arc));

    // Start the local HTTP RPC server immediately
    start_rpc_http_server(Arc::clone(&discord_arc));

    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(discord_state)
        .setup(|app| {
            // ── System Tray ──────────────────────────────────────────
            let show_item     = MenuItem::with_id(app, "show",      "Show Maina",      true, None::<&str>)?;
            let playpause_item= MenuItem::with_id(app, "playpause", "⏯  Play / Pause", true, None::<&str>)?;
            let next_item     = MenuItem::with_id(app, "next",      "⏭  Next Track",   true, None::<&str>)?;
            let sep           = PredefinedMenuItem::separator(app)?;
            let quit_item     = MenuItem::with_id(app, "quit",      "Quit Maina",      true, None::<&str>)?;

            let tray_menu = Menu::with_items(
                app,
                &[&show_item, &playpause_item, &next_item, &sep, &quit_item],
            )?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Maina")
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .on_menu_event({
                    let app_handle = app.handle().clone();
                    move |_tray, event| {
                        let win = app_handle.get_webview_window("main").unwrap();
                        match event.id.as_ref() {
                            "show" => { let _ = win.show(); let _ = win.set_focus(); }
                            "playpause" => dispatch_key(&app_handle, " "),
                            "next"      => dispatch_key(&app_handle, "n"),
                            "quit"      => app_handle.exit(0),
                            _ => {}
                        }
                    }
                })
                .on_tray_icon_event({
                    let app_handle = app.handle().clone();
                    move |_tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            if let Some(win) = app_handle.get_webview_window("main") {
                                if win.is_visible().unwrap_or(false) {
                                    let _ = win.hide();
                                } else {
                                    let _ = win.show();
                                    let _ = win.set_focus();
                                }
                            }
                        }
                    }
                })
                .build(app)?;

            // ── Global Media Key Shortcuts ───────────────────────────
            use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Shortcut, ShortcutState};

            let app_handle = app.handle().clone();
            if let Err(e) = app.global_shortcut().on_shortcuts(
                vec![
                    Shortcut::new(None, Code::MediaPlayPause),
                    Shortcut::new(None, Code::MediaTrackNext),
                    Shortcut::new(None, Code::MediaTrackPrevious),
                ],
                move |_app, shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        match shortcut.key {
                            Code::MediaPlayPause => dispatch_key(&app_handle, " "),
                            Code::MediaTrackNext => dispatch_key(&app_handle, "n"),
                            Code::MediaTrackPrevious => dispatch_key(&app_handle, "p"),
                            _ => {}
                        }
                    }
                },
            ) {
                eprintln!("[Maina] Media key shortcuts could not be registered: {e}");
            } else {
                println!("[Maina] ✓ Media keys registered");
            }

            // ── Open DevTools in debug builds ────────────────────────
            #[cfg(debug_assertions)]
            if let Some(win) = app.get_webview_window("main") {
                win.open_devtools();
            }

            println!("[Maina] ✓ App started");
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .invoke_handler(tauri::generate_handler![
            update_discord_status,
            clear_discord_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running Maina");
}
