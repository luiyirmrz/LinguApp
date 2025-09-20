import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { validateEmail, validatePassword, validateName } from '../../../../utils/validation';

// Input validation schema
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export default publicProcedure
  .input(signupSchema)
  .mutation(async ({ input }) => {
    try {
      // Validate email
      const emailValidation = validateEmail(input.email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          error: emailValidation.errors.join(', '),
          field: 'email',
        };
      }

      // Validate password
      const passwordValidation = validatePassword(input.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors.join(', '),
          field: 'password',
        };
      }

      // Validate name
      const nameValidation = validateName(input.name);
      if (!nameValidation.isValid) {
        return {
          success: false,
          error: nameValidation.errors.join(', '),
          field: 'name',
        };
      }

      // Additional security checks
      const sanitizedEmail = emailValidation.sanitizedValue!;
      const sanitizedName = nameValidation.sanitizedValue!;

      // Check for duplicate email (in a real app, this would check the database)
      // For now, we'll simulate this check
      if (sanitizedEmail === 'test@example.com') {
        return {
          success: false,
          error: 'An account with this email already exists',
          field: 'email',
        };
      }

      // Simulate user creation
      const user = {
        id: `user_${Date.now()}`,
        name: sanitizedName,
        email: sanitizedEmail,
        createdAt: new Date().toISOString(),
        emailVerified: false,
      };

      return {
        success: true,
        user,
        message: 'Account created successfully',
      };

    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Internal server error',
        field: 'general',
      };
    }
  });
