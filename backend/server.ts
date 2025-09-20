import { serve } from '@hono/node-server';
import app from './hono';

const port = 8081;

console.log(`🚀 Starting LinguApp Backend Server on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Backend server is running on http://localhost:${info.port}`);
  console.log(`📡 Health check: http://localhost:${info.port}/`);
  console.log(`🔗 tRPC endpoint: http://localhost:${info.port}/trpc/`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down backend server...');
  process.exit(0);
});


