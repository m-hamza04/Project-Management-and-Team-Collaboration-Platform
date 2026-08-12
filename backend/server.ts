import 'dotenv/config';
import { createServer } from 'http';
import app from './src/app';
import { initSocket } from './src/config/socket';

const PORT = process.env.PORT || 5000;

// Express app alone can't host Socket.io — it needs the raw HTTP server,
// so we create that manually and let Express handle regular requests on it.
const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io ready for real-time connections`);
});
