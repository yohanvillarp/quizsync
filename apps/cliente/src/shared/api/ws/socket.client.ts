import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(url?: string) {
    if (this.socket) return;

    const connectionUrl = url || import.meta.env.VITE_ENGINE_WS_URL || 'http://localhost:3002';

    this.socket = io(connectionUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      if (import.meta.env.DEV) console.log(`[WS] Connected with ID: ${this.socket?.id}`);
      const callbacks = this.listeners.get('connect');
      if (callbacks) callbacks.forEach(cb => cb());
    });

    this.socket.on('disconnect', () => {
      if (import.meta.env.DEV) console.log(`[WS] Disconnected`);
      const callbacks = this.listeners.get('disconnect');
      if (callbacks) callbacks.forEach(cb => cb());
    });

    // Delegar eventos registrados dinámicamente
    this.socket.onAny((event: string, ...args: any[]) => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.forEach(cb => cb(...args));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      this.listeners.set(event, callbacks.filter(cb => cb !== callback));
    }
  }

  emit(event: string, payload?: any, ack?: (response: any) => void) {
    if (!this.socket) {
      console.warn(`[WS] Emit '${event}' ignored: Socket not connected.`);
      return;
    }
    
    if (ack) {
      this.socket.emit(event, payload, ack);
    } else {
      this.socket.emit(event, payload);
    }
  }

  getSocketId() {
    return this.socket?.id;
  }
}

export const socketClient = new SocketClient();
