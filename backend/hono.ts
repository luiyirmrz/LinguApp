import { Hono } from 'hono';
import { trpcServer } from '@hono/trpc-server';
import { cors } from 'hono/cors';
import { appRouter } from './trpc/app-router';
import { createContext } from './trpc/create-context';
import { 
  authRateLimit, 
  signinRateLimit, 
  signupRateLimit,
  generalRateLimit,
} from './middleware/rateLimiter';
import { 
  securityHeaders, 
  requestLogger, 
  ipFilter, 
  requestSizeLimit,
  secureCorsOptions, 
} from './middleware/securityMiddleware';
import { createAuthResult } from '../utils/auth';

// app will be mounted at /api
const app = new Hono();

// Apply security middleware first
app.use('*', securityHeaders());
app.use('*', requestLogger());
app.use('*', ipFilter());
app.use('*', requestSizeLimit());

// Enable CORS with security configuration
app.use('*', cors(secureCorsOptions));

// Apply general rate limiting to all tRPC routes
app.use('/trpc/*', generalRateLimit);

// Apply specific rate limiting to authentication routes
app.use('/trpc/auth/signin', signinRateLimit);
app.use('/trpc/auth/signup', signupRateLimit);
app.use('/trpc/auth/*', authRateLimit);

// Apply rate limiting to test endpoints
app.use('/test/signin', signinRateLimit);
app.use('/test/signup', signupRateLimit);
app.use('/test/general', generalRateLimit);

// Apply rate limiting to direct HTTP auth endpoints
app.use('/api/auth/signin', signinRateLimit);
app.use('/api/auth/signup', signupRateLimit);

// Mount tRPC router at /trpc
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
    endpoint: '/trpc',
    onError: ({ error, path }) => {
      console.error(`tRPC Error on path ${path}:`, error);
    },
  }),
);

// Simple health check endpoint
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'API is running' });
});

// Test endpoints for rate limiting verification
app.post('/test/signin', (c) => {
  return c.json({ 
    success: true, 
    message: 'Signin test endpoint',
    timestamp: new Date().toISOString(),
  });
});

app.post('/test/signup', (c) => {
  return c.json({ 
    success: true, 
    message: 'Signup test endpoint',
    timestamp: new Date().toISOString(),
  });
});

app.post('/test/general', (c) => {
  return c.json({ 
    success: true, 
    message: 'General test endpoint',
    timestamp: new Date().toISOString(),
  });
});

// Direct HTTP signup endpoint (bypassing tRPC for testing)
app.post('/api/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Signup request received:', body);
    
    const { name, email, password } = body;
    
    // Import validation functions
    const { validateEmail, validatePassword, validateName } = await import('../utils/validation');
    
    // Validate input
    if (!name || !email || !password) {
      return c.json({
        success: false,
        error: 'Name, email, and password are required',
        field: 'general',
      }, 400);
    }
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return c.json({
        success: false,
        error: emailValidation.errors.join(', '),
        field: 'email',
      }, 400);
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return c.json({
        success: false,
        error: passwordValidation.errors.join(', '),
        field: 'password',
      }, 400);
    }

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return c.json({
        success: false,
        error: nameValidation.errors.join(', '),
        field: 'name',
      }, 400);
    }

    // Additional security checks
    const sanitizedEmail = emailValidation.sanitizedValue!;
    const sanitizedName = nameValidation.sanitizedValue!;

    // Check for duplicate email (in a real app, this would check the database)
    // Use environment variable for test email to avoid hardcoding
    const testEmail = process.env.BACKEND_TEST_EMAIL_1 || 'configured@example.com';
    if (sanitizedEmail === testEmail) {
      return c.json({
        success: false,
        error: 'An account with this email already exists',
        field: 'email',
      }, 409);
    }

    // Simulate user creation with secure token generation
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      name: sanitizedName,
      email: sanitizedEmail,
      createdAt: new Date().toISOString(),
      emailVerified: false,
    };

    console.log('User created successfully:', user);

    // Use secure token generation for new user signup
    const authResult = createAuthResult(true, {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return c.json({
      success: true,
      user,
      token: authResult.token,
      message: 'Account created successfully',
    }, 201);

  } catch (error) {
    console.error('Signup error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
      field: 'general',
    }, 500);
  }
});

// Direct HTTP signin endpoint (bypassing tRPC for testing)
app.post('/api/auth/signin', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Signin request received:', body);
    
    const { email, password } = body;
    
    // Import validation functions
    const { validateEmail } = await import('../utils/validation');
    
    // Validate input
    if (!email || !password) {
      return c.json({
        success: false,
        error: 'Email and password are required',
        field: 'general',
      }, 400);
    }
    
    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return c.json({
        success: false,
        error: emailValidation.errors.join(', '),
        field: 'email',
      }, 400);
    }

    // Basic password validation (length check)
    if (password.length < 6) {
      return c.json({
        success: false,
        error: 'Password must be at least 6 characters long',
        field: 'password',
      }, 400);
    }

    const sanitizedEmail = emailValidation.sanitizedValue!;

    // Simulate authentication check - using environment variables for security
    const validCredentials: Record<string, string> = {
      [process.env.BACKEND_TEST_EMAIL_1 || '']: process.env.BACKEND_TEST_PASSWORD_1 || '',
      [process.env.BACKEND_DEMO_EMAIL || '']: process.env.BACKEND_DEMO_PASSWORD || '',
      [process.env.BACKEND_TEST_EMAIL_2 || '']: process.env.BACKEND_TEST_PASSWORD_2 || '',
    };

    // Remove any empty credential pairs for security
    Object.keys(validCredentials).forEach(email => {
      if (!email || !validCredentials[email]) {
        delete validCredentials[email];
      }
    });

    if (!validCredentials[sanitizedEmail] || validCredentials[sanitizedEmail] !== password) {
      return c.json({
        success: false,
        error: 'Invalid email or password',
        field: 'credentials',
      }, 401);
    }

    // Simulate successful authentication with secure token generation
    const user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      email: sanitizedEmail,
      name: 'Test User',
    };

    console.log('User signed in successfully:', user);

    // Use secure token generation instead of predictable timestamp-based tokens
    const authResult = createAuthResult(true, user);

    return c.json({
      success: true,
      user: authResult.user,
      token: authResult.token,
      message: 'Login successful',
    }, 200);

  } catch (error) {
    console.error('Signin error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
      field: 'general',
    }, 500);
  }
});

// Direct HTTP language settings endpoint
app.put('/user/language-settings', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Language settings update request received:', body);
    
    const { mainLanguage, targetLanguage, showTranslations, showPhonetics } = body;
    
    // Validate required fields
    if (!mainLanguage || !targetLanguage || showTranslations === undefined || showPhonetics === undefined) {
      return c.json({
        success: false,
        error: 'All fields are required: mainLanguage, targetLanguage, showTranslations, showPhonetics',
        field: 'validation',
      }, 400);
    }
    
    // Validate field types
    if (typeof mainLanguage !== 'string' || typeof targetLanguage !== 'string') {
      return c.json({
        success: false,
        error: 'mainLanguage and targetLanguage must be strings',
        field: 'validation',
      }, 400);
    }
    
    if (typeof showTranslations !== 'boolean' || typeof showPhonetics !== 'boolean') {
      return c.json({
        success: false,
        error: 'showTranslations and showPhonetics must be booleans',
        field: 'validation',
      }, 400);
    }
    
    // Validate language codes (basic validation)
    if (mainLanguage.length < 2 || mainLanguage.length > 10) {
      return c.json({
        success: false,
        error: 'mainLanguage must be between 2 and 10 characters',
        field: 'mainLanguage',
      }, 400);
    }
    
    if (targetLanguage.length < 2 || targetLanguage.length > 10) {
      return c.json({
        success: false,
        error: 'targetLanguage must be between 2 and 10 characters',
        field: 'targetLanguage',
      }, 400);
    }

    // Simulate successful update
    const updatedSettings = {
      mainLanguage,
      targetLanguage,
      showTranslations,
      showPhonetics,
      updatedAt: new Date().toISOString(),
    };

    console.log('Language settings updated successfully:', updatedSettings);

    return c.json({
      success: true,
      ...updatedSettings,
    }, 200);

  } catch (error) {
    console.error('Language settings update error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
      field: 'general',
    }, 500);
  }
});

export default app;
