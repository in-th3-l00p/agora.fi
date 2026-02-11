import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface AgoraSocket extends WebSocket {
  subscriptions: Set<string>;
  wallet?: string;
  isAlive: boolean;
}

let wss: WebSocketServer | null = null;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (raw: WebSocket) => {
    const ws = raw as AgoraSocket;
    ws.subscriptions = new Set();
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          case 'auth': {
            try {
              const payload = jwt.verify(msg.token, config.jwtSecret) as { address: string };
              ws.wallet = payload.address;
              ws.send(JSON.stringify({ type: 'auth', status: 'ok' }));
            } catch {
              ws.send(JSON.stringify({ type: 'auth', status: 'error', message: 'Invalid token' }));
            }
            break;
          }

          case 'subscribe': {
            if (msg.spaceId) {
              ws.subscriptions.add(msg.spaceId);
              ws.send(JSON.stringify({ type: 'subscribed', spaceId: msg.spaceId }));
            }
            break;
          }

          case 'unsubscribe': {
            if (msg.spaceId) {
              ws.subscriptions.delete(msg.spaceId);
              ws.send(JSON.stringify({ type: 'unsubscribed', spaceId: msg.spaceId }));
            }
            break;
          }
        }
      } catch {
        // Ignore malformed messages
      }
    });
  });

  // Heartbeat — terminate stale connections every 30s
  const interval = setInterval(() => {
    wss!.clients.forEach((raw: WebSocket) => {
      const ws = raw as AgoraSocket;
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  return wss;
}

/**
 * Broadcast an event to connected clients.
 * If spaceId is provided, only clients subscribed to that space receive it.
 */
export function broadcast(event: string, data: unknown, spaceId?: string) {
  if (!wss) return;

  const message = JSON.stringify({ event, data, spaceId });

  wss.clients.forEach((raw: WebSocket) => {
    const ws = raw as AgoraSocket;
    if (ws.readyState !== WebSocket.OPEN) return;

    // If a spaceId is given, only send to subscribers of that space
    if (spaceId && !ws.subscriptions.has(spaceId)) return;

    ws.send(message);
  });
}
