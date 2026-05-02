import { createServer } from './server.js';
import { env } from './config/env.js';

const server = createServer();

// Bind to 0.0.0.0 so the server is reachable from physical devices on the same network
server.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Backend listening on http://0.0.0.0:${env.PORT}`);
  console.log(`Access from device: http://192.168.100.11:${env.PORT}`);
});
