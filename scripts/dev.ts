import { startServer } from '../server/index.js';
import { createServer } from 'vite';

let viteServer;

async function startDev() {
  await startServer(3001);

  viteServer = await createServer({
    configFile: './vite.config.js',
  });

  await viteServer.listen();
  console.log(
    `Vite dev server running on port ${viteServer.config.server.port}`,
  );
}

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing servers gracefully...');

  if (viteServer) {
    try {
      await viteServer.close();
      console.log('Vite server closed successfully');
    } catch (err) {
      console.error('Error closing Vite server:', err);
    }
  }

  process.exit(0);
});

startDev();
