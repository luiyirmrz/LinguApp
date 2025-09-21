import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { validateEmail } from '../../../../utils/validation';
import { createAuthResult } from '../../../../utils/auth';

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

      if (!validCredentials[sanitizedEmail] || validCredentials[sanitizedEmail] !== input.password) {
        return {
          success: false,
          error: 'Invalid email or password',
          field: 'credentials',
        };
      }

      // Simulate successful authentication with secure token generation
      const user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        email: sanitizedEmail,
        name: 'Test User',
      };

      // Use secure token generation instead of predictable timestamp-based tokens
      return createAuthResult(true, user);

    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        error: 'Internal server error',
        field: 'general',
      };
    }
  });
