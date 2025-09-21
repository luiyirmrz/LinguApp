/**
 * Comprehensive Validation Utilities for LinguApp
 * Provides robust email, password, and input validation
 * Includes security-focused validation patterns
 */

// Email validation regex - RFC 5322 compliant
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Enhanced email validation with additional security checks
export const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Password validation patterns
export const PASSWORD_PATTERNS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: /[A-Z]/,
  requireLowercase: /[a-z]/,
  requireNumber: /\d/,
  requireSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
  noSpaces: /^\S*$/,
  noCommonPatterns: /^(?!(?:password|123456|qwerty|abc123|admin|user|test|guest|root|administrator|letmein|welcome|login|pass|secret|master|default|changeme|password123|12345678|qwerty123|admin123|root123|test123|guest123|welcome123|login123|pass123|secret123|master123|default123|changeme123)$)/i,
};

// Common invalid email patterns to block
export const INVALID_EMAIL_PATTERNS = [
  /^[^@]*$/, // No @ symbol
  /@[^.]*$/, // No domain extension
  /^@.*$/, // Starts with @
  /.*@$/, // Ends with @
  /\.{2,}/, // Multiple consecutive dots
  /^\./, // Starts with dot
  /\.$/, // Ends with dot
  /@.*@/, // Multiple @ symbols
  /\s/, // Contains spaces
  /[<>]/, // Contains angle brackets
  /['"]/, // Contains quotes
];

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
  warnings?: string[];
}

// Email validation function
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitizedValue = email.trim().toLowerCase();

  // Check if email is provided
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      errors: ['Email is required'],
      sanitizedValue: '',
    };
  }

  // Check length
  if (sanitizedValue.length > 254) {
    errors.push('Email address is too long (maximum 254 characters)');
  }

  // Check for invalid patterns
  for (const pattern of INVALID_EMAIL_PATTERNS) {
    if (pattern.test(sanitizedValue)) {
      errors.push('Invalid email format');
      break;
    }
  }

  // Check basic email format
  if (!EMAIL_REGEX.test(sanitizedValue)) {
    errors.push('Please enter a valid email address');
  }

  // Check for suspicious patterns
  if (sanitizedValue.includes('..')) {
    errors.push('Email cannot contain consecutive dots');
  }

  // Check for common disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
  ];
  
  const domain = sanitizedValue.split('@')[1];
  if (domain && disposableDomains.includes(domain)) {
    warnings.push('Disposable email addresses are not recommended');
  }

  // Check for common typos in popular domains
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const commonTypos = ['gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com'];
  
  if (domain && commonTypos.includes(domain)) {
    warnings.push(`Did you mean ${commonDomains[commonTypos.indexOf(domain)]}?`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitizedValue : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// Password validation function
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!password || password.length === 0) {
    return {
      isValid: false,
      errors: ['Password is required'],
      sanitizedValue: '',
    };
  }

  // Length checks
  if (password.length < PASSWORD_PATTERNS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_PATTERNS.minLength} characters long`);
  }

  if (password.length > PASSWORD_PATTERNS.maxLength) {
    errors.push(`Password must be no more than ${PASSWORD_PATTERNS.maxLength} characters long`);
  }

  // Character requirements
  if (!PASSWORD_PATTERNS.requireUppercase.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!PASSWORD_PATTERNS.requireLowercase.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!PASSWORD_PATTERNS.requireNumber.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!PASSWORD_PATTERNS.requireSpecialChar.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  if (!PASSWORD_PATTERNS.noSpaces.test(password)) {
    errors.push('Password cannot contain spaces');
  }

  // Check for common patterns
  if (!PASSWORD_PATTERNS.noCommonPatterns.test(password)) {
    warnings.push('Password contains common patterns that are easy to guess');
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Password contains repeated characters');
  }

  // Check for sequential characters
  if (/123|abc|qwe|asd|zxc/i.test(password)) {
    warnings.push('Password contains sequential characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: password,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// Name validation function
export function validateName(name: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      errors: ['Name is required'],
      sanitizedValue: '',
    };
  }

  const sanitizedValue = name.trim();

  // Length checks
  if (sanitizedValue.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (sanitizedValue.length > 50) {
    errors.push('Name must be no more than 50 characters long');
  }

  // Character checks
  if (!/^[a-zA-Z\s\-'.]+$/.test(sanitizedValue)) {
    errors.push('Name can only contain letters, spaces, hyphens, apostrophes, and periods');
  }

  // Check for suspicious patterns
  if (/^\d+$/.test(sanitizedValue)) {
    errors.push('Name cannot be only numbers');
  }

  if (/^[^a-zA-Z]/.test(sanitizedValue)) {
    errors.push('Name must start with a letter');
  }

  // Check for excessive special characters
  if ((sanitizedValue.match(/[^a-zA-Z\s]/g) || []).length > sanitizedValue.length * 0.3) {
    warnings.push('Name contains many special characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitizedValue : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

// Comprehensive input validation
export function validateInput(input: string, type: 'email' | 'password' | 'name'): ValidationResult {
  switch (type) {
    case 'email':
      return validateEmail(input);
    case 'password':
      return validatePassword(input);
    case 'name':
      return validateName(input);
    default:
      return {
        isValid: false,
        errors: ['Invalid validation type'],
        sanitizedValue: input,
      };
  }
}

// Enhanced sanitize input to prevent XSS and injection attacks
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/["']/g, '') // Remove quotes
    .replace(/[;&|`${}[\]]/g, '') // Remove shell metacharacters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, '') // Remove data URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/vbscript:/gi, '') // Remove VBScript
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '') // Remove iframe tags
    .substring(0, 1000); // Limit length
}

// Rate limiting helper
export function isRateLimited(attempts: number, timeWindow: number, maxAttempts: number): boolean {
  return attempts >= maxAttempts;
}

// Export validation constants for use in other modules
export const VALIDATION_CONSTANTS = {
  EMAIL_REGEX,
  STRICT_EMAIL_REGEX,
  PASSWORD_PATTERNS,
  INVALID_EMAIL_PATTERNS,
};
