// Maina Desktop App — Tauri v2
// Discord RPC + System Tray + Media Keys

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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

/// Truncate a string to max `max_chars` characters (Discord field limits)
fn truncate(s: &str, max_chars: usize) -> String {
    if s.chars().count() <= max_chars {
        s.to_string()
    } else {
        let mut t: String = s.chars().take(max_chars - 1).collect();
        t.push('…');
        t
    }
}

// ─────────────────────────────────────────────────────────────
//  Tauri Commands
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
    try_connect_discord(&mut guard);

    if let Some(client) = guard.as_mut() {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;

        let start_ts = now - elapsed_secs as i64;
        let end_ts = if duration_secs > 0 {
            start_ts + duration_secs as i64
        } else {
            0
        };

        // Keep strings alive for the duration of the Activity builder
        let title_str = truncate(&title, 128);
        let artist_str = truncate(&artist, 128);

        // Use the track thumbnail URL as large image (Discord supports external URLs)
        // Fall back to uploaded "maina_logo" asset if no thumbnail
        let large_img = if thumbnail_url.is_empty() {
            "maina_logo".to_string()
        } else {
            thumbnail_url.clone()
        };

        let mut timestamps = Timestamps::new().start(start_ts);
        if end_ts > 0 {
            timestamps = timestamps.end(end_ts);
        }

        let activity = Activity::new()
            // ActivityType::Listening → Discord shows "Listening to Maina"
            .activity_type(ActivityType::Listening)
            // details = big text = song title
            .details(&title_str)
            // state = small text = artist name (no "by" prefix)
            .state(&artist_str)
            .assets(
                Assets::new()
                    .large_image(&large_img)
                    .large_text(&title_str)
                    // No small image/text — cleaner look
            )
            .timestamps(timestamps)
            // "Listen on Maina" button — like Spotify's Discord integration
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

#[tauri::command]
fn clear_discord_status(state: tauri::State<DiscordRpcState>) {
    let mut guard = state.0.lock().unwrap();
    if let Some(client) = guard.as_mut() {
        if let Err(e) = client.clear_activity() {
            eprintln!("[Maina] Discord RPC clear_activity failed: {e}");
            let _ = client.close();
            *guard = None;
        }
    }
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
    let discord_state = DiscordRpcState(Arc::new(Mutex::new(None)));

    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(discord_state)
        .setup(|app| {
            // ── System Tray ──────────────────────────────────────────
            let show_item = MenuItem::with_id(app, "show", "Show Maina", true, None::<&str>)?;
            let playpause_item =
                MenuItem::with_id(app, "playpause", "⏯  Play / Pause", true, None::<&str>)?;
            let next_item =
                MenuItem::with_id(app, "next", "⏭  Next Track", true, None::<&str>)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit Maina", true, None::<&str>)?;

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
                            "show" => {
                                let _ = win.show();
                                let _ = win.set_focus();
                            }
                            "playpause" => dispatch_key(&app_handle, " "),
                            "next" => dispatch_key(&app_handle, "n"),
                            "quit" => app_handle.exit(0),
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
