/**
 * Discord Local WebSocket RPC
 *
 * Connects to Discord's local RPC server (port 6463-6472) which
 * Discord Desktop runs on your machine. This lets any web page set
 * Rich Presence WITHOUT installing any extra software.
 *
 * Requirements:
 *   • Discord DESKTOP app must be running
 *   • User authorizes once via the Discord popup (stored in localStorage)
 */

const CLIENT_ID = '1503459571195445449';
const STORAGE_KEY = 'maina_discord_token';

type RPCMsg = { cmd: string; evt?: string; data?: Record<string, unknown>; nonce?: string };

export class DiscordLocalRPC {
  private ws: WebSocket | null = null;
  private nonceCounter = 0;
  private pendingPromises = new Map<string, (msg: RPCMsg) => void>();
  private connected = false;

  /** Try ports 6463-6472 until one works */
  async connect(): Promise<boolean> {
    for (let port = 6463; port <= 6472; port++) {
      try {
        const connected = await this._tryPort(port);
        if (connected) {
          console.log(`[Maina RPC] Connected to Discord on port ${port}`);
          return true;
        }
      } catch {
        continue;
      }
    }
    console.log('[Maina RPC] Discord desktop not detected');
    return false;
  }

  private _tryPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 1000);

      const ws = new WebSocket(`ws://127.0.0.1:${port}/?v=1&client_id=${CLIENT_ID}`);
      ws.onopen = () => {
        // Wait for READY event
        ws.onmessage = (e) => {
          const msg: RPCMsg = JSON.parse(e.data);
          if (msg.cmd === 'DISPATCH' && msg.evt === 'READY') {
            clearTimeout(timeout);
            this.ws = ws;
            this._setupMessageHandler();
            resolve(true);
          }
        };
      };
      ws.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
    });
  }

  private _setupMessageHandler() {
    if (!this.ws) return;
    this.ws.onmessage = (e) => {
      const msg: RPCMsg = JSON.parse(e.data);
      if (msg.nonce && this.pendingPromises.has(msg.nonce)) {
        this.pendingPromises.get(msg.nonce)!(msg);
        this.pendingPromises.delete(msg.nonce);
      }
    };
    this.ws.onclose = () => {
      this.connected = false;
      this.ws = null;
    };
  }

  private _send(cmd: string, args: Record<string, unknown>): Promise<RPCMsg> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not open'));
        return;
      }
      const nonce = String(++this.nonceCounter);
      this.pendingPromises.set(nonce, resolve);
      this.ws.send(JSON.stringify({ cmd, args, nonce }));
      setTimeout(() => {
        if (this.pendingPromises.has(nonce)) {
          this.pendingPromises.delete(nonce);
          reject(new Error('Timeout'));
        }
      }, 5000);
    });
  }

  /** Try cached token first, then do full OAuth2 flow */
  async authenticate(): Promise<boolean> {
    // Try cached token
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const res = await this._send('AUTHENTICATE', { access_token: cached });
        if (res.cmd === 'AUTHENTICATE' && !res.data?.code) {
          this.connected = true;
          console.log('[Maina RPC] Authenticated with cached token');
          return true;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Fresh OAuth2 flow
    try {
      const authRes = await this._send('AUTHORIZE', {
        client_id: CLIENT_ID,
        scopes: ['rpc', 'rpc.activities.write'],
        prompt: 'none',
      });

      const code = (authRes.data as { code?: string })?.code;
      if (!code) return false;

      // Exchange code for token via our server-side route (keeps client_secret safe)
      const tokenRes = await fetch('/api/discord-rpc-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!tokenRes.ok) return false;

      const { access_token } = await tokenRes.json();
      if (!access_token) return false;

      // Save for next time
      localStorage.setItem(STORAGE_KEY, access_token);

      const authResult = await this._send('AUTHENTICATE', { access_token });
      this.connected = authResult.cmd === 'AUTHENTICATE';
      return this.connected;
    } catch (e) {
      console.debug('[Maina RPC] Auth failed:', e);
      return false;
    }
  }

  setActivity(title: string, artist: string, thumbnailUrl: string, duration: number, elapsed: number, vibeInfo?: { active: boolean, participants: number, roomId: string | null }) {
    if (!this.connected || !this.ws) return;

    const now = Math.floor(Date.now() / 1000);
    const startTs = now - elapsed;
    const endTs = duration > 0 ? startTs + duration : 0;

    const timestamps: Record<string, number> = { start: startTs };
    if (endTs > 0) timestamps.end = endTs;

    let stateStr = artist.slice(0, 128);
    let buttonLabel = 'Listen on Maina';
    let buttonUrl = 'https://maina-offical.vercel.app';

    if (vibeInfo?.active) {
      stateStr = `Vibing with ${vibeInfo.participants} ${vibeInfo.participants === 1 ? 'person' : 'people'}`;
      if (vibeInfo.roomId) {
        buttonLabel = 'Join Vibe Together';
        buttonUrl = `https://maina-offical.vercel.app/library?vibe=${vibeInfo.roomId}`;
      }
    }

    this._send('SET_ACTIVITY', {
      pid: 1337,
      activity: {
        type: 2, // LISTENING
        details: title.slice(0, 128),
        state: stateStr,
        assets: {
          large_image: thumbnailUrl || 'maina_logo',
          large_text: title.slice(0, 128),
          small_image: vibeInfo?.active ? 'maina_logo' : undefined,
          small_text: vibeInfo?.active ? artist.slice(0, 128) : undefined
        },
        timestamps,
        buttons: [
          { label: buttonLabel, url: buttonUrl },
        ],
      },
    }).catch(() => {});
  }

  clearActivity() {
    if (!this.connected || !this.ws) return;
    this._send('SET_ACTIVITY', { pid: 1337, activity: null }).catch(() => {});
  }

  get isConnected() { return this.connected; }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }
}
