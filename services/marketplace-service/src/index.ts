import http from 'http';
import { app } from './app';
import { config } from './config';
import { setupWebSocket } from './ws';

const server = http.createServer(app);

setupWebSocket(server);

server.listen(config.port, () => {
  console.log(`marketplace-service running on port ${config.port}`);
  console.log(`WebSocket available at ws://localhost:${config.port}/ws`);
});
