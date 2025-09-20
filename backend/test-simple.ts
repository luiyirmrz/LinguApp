import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { cors } from 'hono/cors';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// Simple tRPC setup
const t = initTRPC.create();
const publicProcedure = t.procedure;
const createTRPCRouter = t.router;

// Simple test procedure
const testRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return { message: `Hello ${input.name}!` };
    }),
});

const app = new Hono();
app.use('*', cors());

// Simple context
const createContext = async () => {
  return {};
};

// Mount tRPC
app.use(
  '/trpc/*',
  trpcServer({
    router: testRouter,
    createContext,
  }),
);

app.get('/', (c) => {
  return c.json({ status: 'Simple test server running' });
});

export default app;
