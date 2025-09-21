/**
 * Input Validation Service for LinguApp
 * Provides comprehensive input validation, sanitization, and security checks
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  sanitize?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

class InputValidationService {
  private readonly MAX_STRING_LENGTH = 1000;
  private readonly MAX_EMAIL_LENGTH = 254;
  private readonly MAX_PASSWORD_LENGTH = 128;
  private readonly MIN_PASSWORD_LENGTH = 8;

  // Common patterns
  private readonly patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    username: /^[a-zA-Z0-9_-]{3,20}$/,
    phone: /^\+?[\d\s-()]{10,15}$/,
    url: /^https?:\/\/.+/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    lettersOnly: /^[a-zA-Z\s]+$/,
    numbersOnly: /^\d+$/,
  };

  /**
   * Validate a single value against a rule
   */
  validateValue(value: any, rule: ValidationRule): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = value;

    // Sanitize if requested
    if (rule.sanitize && typeof value === 'string') {
      sanitizedValue = this.sanitizeString(value);
    }

    // Check required
    if (rule.required && (sanitizedValue === null || sanitizedValue === undefined || sanitizedValue === '')) {
      errors.push('This field is required');
      return { isValid: false, errors, sanitizedValue };
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (sanitizedValue === null || sanitizedValue === undefined || sanitizedValue === '')) {
      return { isValid: true, errors: [], sanitizedValue };
    }

    // Check type-specific validations
    if (typeof sanitizedValue === 'string') {
      // Length validations
      if (rule.minLength && sanitizedValue.length < rule.minLength) {
        errors.push(`Minimum length is ${rule.minLength} characters`);
      }
      if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
        errors.push(`Maximum length is ${rule.maxLength} characters`);
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
        errors.push('Invalid format');
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(sanitizedValue);
      if (customResult !== true) {
        errors.push(typeof customResult === 'string' ? customResult : 'Invalid value');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue,
    };
  }

  /**
   * Validate an object against a schema
   */
  validateObject(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const errors: string[] = [];
    const sanitizedData: Record<string, any> = {};

    for (const [field, rule] of Object.entries(schema)) {
      const result = this.validateValue(data[field], rule);
      
      if (!result.isValid) {
        errors.push(...result.errors.map(error => `${field}: ${error}`));
      }
      
      sanitizedData[field] = result.sanitizedValue;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitizedData,
    };
  }

  /**
   * Sanitize a string input
   */
  sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, this.MAX_STRING_LENGTH); // Limit length
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): ValidationResult {
    return this.validateValue(email, {
      required: true,
      maxLength: this.MAX_EMAIL_LENGTH,
      pattern: this.patterns.email,
      sanitize: true,
    });
  }

  /**
   * Validate password
   */
  validatePassword(password: string): ValidationResult {
    return this.validateValue(password, {
      required: true,
      minLength: this.MIN_PASSWORD_LENGTH,
      maxLength: this.MAX_PASSWORD_LENGTH,
      custom: (value) => {
        if (!this.patterns.password.test(value)) {
          return 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character';
        }
        return true;
      },
    });
  }

  /**
   * Validate username
   */
  validateUsername(username: string): ValidationResult {
    return this.validateValue(username, {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: this.patterns.username,
      sanitize: true,
    });
  }

  /**
   * Validate user registration data
   */
  validateUserRegistration(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): ValidationResult {
    const schema: ValidationSchema = {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: this.patterns.lettersOnly,
        sanitize: true,
      },
      email: {
        required: true,
        maxLength: this.MAX_EMAIL_LENGTH,
        pattern: this.patterns.email,
        sanitize: true,
      },
      password: {
        required: true,
        minLength: this.MIN_PASSWORD_LENGTH,
        maxLength: this.MAX_PASSWORD_LENGTH,
        custom: (value) => {
          if (!this.patterns.password.test(value)) {
            return 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character';
          }
          return true;
        },
      },
    };

    const result = this.validateObject(data, schema);

    // Check password confirmation
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      result.errors.push('Passwords do not match');
      result.isValid = false;
    }

    return result;
  }

  /**
   * Validate lesson data
   */
  validateLessonData(data: {
    title: string;
    content: string;
    difficulty?: string;
  }): ValidationResult {
    const schema: ValidationSchema = {
      title: {
        required: true,
        minLength: 3,
        maxLength: 100,
        sanitize: true,
      },
      content: {
        required: true,
        minLength: 10,
        maxLength: 5000,
        sanitize: true,
      },
      difficulty: {
        required: false,
        custom: (value) => {
          if (value && !['beginner', 'intermediate', 'advanced'].includes(value)) {
            return 'Difficulty must be beginner, intermediate, or advanced';
          }
          return true;
        },
      },
    };

    return this.validateObject(data, schema);
  }

  /**
   * Validate search query
   */
  validateSearchQuery(query: string): ValidationResult {
    return this.validateValue(query, {
      required: true,
      minLength: 1,
      maxLength: 100,
      sanitize: true,
      custom: (value) => {
        // Check for SQL injection patterns
        const sqlPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
          /(--|\/\*|\*\/)/,
          /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
        ];

        for (const pattern of sqlPatterns) {
          if (pattern.test(value)) {
            return 'Invalid search query';
          }
        }

        return true;
      },
    });
  }

  /**
   * Validate file upload
   */
  validateFileUpload(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}): ValidationResult {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp3', '.wav'],
    } = options;

    const errors: string[] = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }

    // Check for malicious file names
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      errors.push('Invalid file name');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check for XSS patterns
   */
  detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHTML(html: string): string {
    if (this.detectXSS(html)) {
      return html.replace(/<[^>]*>/g, ''); // Remove all HTML tags if XSS detected
    }

    // Allow only safe HTML tags
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const tagPattern = new RegExp(`<(?!/?(?:${allowedTags.join('|')})(?:\\s|>))[^>]*>`, 'gi');
    
    return html.replace(tagPattern, '');
  }
}

// Create singleton instance
export const inputValidationService = new InputValidationService();

// Export types and service
export { InputValidationService };
export default inputValidationService;
