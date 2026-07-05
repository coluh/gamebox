type MessageHandler = (payload: any) => void;

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:3600/api";
const WS_URL = BASE_URL.replace(/^http/, "ws").replace(/\/api\/?/, "/ws");

class GameSocket {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private token: string = "";

  connect(token: string) {
    this.token = token;
    this.ws = new WebSocket(`${WS_URL}?token=${token}`); // TODO: auto refresh token

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };
    this.ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        this.handlers.get(type)?.forEach((fn) => fn(payload));
      } catch {}
    };
    this.ws.onclose = (ev) => {
      if (!ev.wasClean) {
        this.stopHeartbeat();
        this.reconnect();
      }
    };
  }

  send(type: string, payload?: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  // register handler for type
  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => this.send("ping"), 30000);
  }
  private stopHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
  }

  private reconnect() {
    if (this.reconnectAttempts >= 5) return;
    setTimeout(
      () => {
        this.reconnectAttempts++;
        this.connect(this.token);
      },
      Math.min(1000 * 2 ** this.reconnectAttempts, 10000),
    );
  }

  disconnect() {
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
  }
}

export const gameSocket = new GameSocket();
