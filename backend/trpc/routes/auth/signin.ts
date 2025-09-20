import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { validateEmail } from '../../../../utils/validation';

// Input validation schema
const signinSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export default publicProcedure
  .input(signinSchema)
  .mutation(async ({ input }) => {
    try {
      // Validate email format
      const emailValidation = validateEmail(input.email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          error: emailValidation.errors.join(', '),
          field: 'email',
        };
      }

      // Basic password validation (length check)
      if (input.password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long',
          field: 'password',
        };
      }

      const sanitizedEmail = emailValidation.sanitizedValue!;

      // Simulate authentication check - using environment variables for security
      // In a real app, this would verify credentials against the database
      const validCredentials: Record<string, string> = {
        [process.env.BACKEND_TEST_EMAIL_1 || 'test@example.com']: process.env.BACKEND_TEST_PASSWORD_1 || 'password123',
        [process.env.BACKEND_DEMO_EMAIL || 'demo@localhost.dev']: process.env.BACKEND_DEMO_PASSWORD || 'DemoPass123!',
        [process.env.BACKEND_TEST_EMAIL_2 || 'test1@localhost.dev']: process.env.BACKEND_TEST_PASSWORD_2 || 'TestPass123!',
      };

      if (!validCredentials[sanitizedEmail] || validCredentials[sanitizedEmail] !== input.password) {
        return {
          success: false,
          error: 'Invalid email or password',
          field: 'credentials',
        };
      }

      // Simulate successful authentication
      const user = {
        id: `user_${Date.now()}`,
        email: sanitizedEmail,
        name: 'Test User',
        lastLoginAt: new Date().toISOString(),
      };

      return {
        success: true,
        user,
        token: `jwt_token_${Date.now()}`,
        message: 'Login successful',
      };

    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        error: 'Internal server error',
        field: 'general',
      };
    }
  });
