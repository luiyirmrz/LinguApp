import { createTRPCRouter } from './create-context';
import hiRoute from './routes/example/hi/route';
import signupRoute from './routes/auth/signup';
import signinRoute from './routes/auth/signin';
import { languageSettingsRoute } from './routes/user/language-settings';

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    signup: signupRoute,
    signin: signinRoute,
  }),
  user: createTRPCRouter({
    languageSettings: languageSettingsRoute,
  }),
});

export type AppRouter = typeof appRouter;
