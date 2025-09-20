import { serve } from '@hono/node-server';
import app from './test-simple';

const port = 8082;

console.log(`🚀 Starting Simple Test Server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Test server is running on http://localhost:${info.port}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test server...');
  process.exit(0);
});
