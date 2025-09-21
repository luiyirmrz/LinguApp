/**
 * Enhanced Input Validation Middleware
 * Comprehensive protection against injection vulnerabilities
 * XSS, SQL injection, and command injection prevention
 */

import { Context, Next } from 'hono';
import { z } from 'zod';

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\bUNION\b.*\bSELECT\b)/i,
  /(\bSELECT\b.*\bFROM\b)/i,
  /(\bINSERT\b.*\bINTO\b)/i,
  /(\bUPDATE\b.*\bSET\b)/i,
  /(\bDELETE\b.*\bFROM\b)/i,
  /(\bDROP\b.*\bTABLE\b)/i,
  /(\bCREATE\b.*\bTABLE\b)/i,
  /(\bALTER\b.*\bTABLE\b)/i,
  /(\bEXEC\b.*\()/i,
  /(\bEXECUTE\b.*\()/i,
  /(;.*--)/i,
  /(--.*)/i,
  /('.*OR.*'.*=.*')/i,
  /(".*OR.*".*=.*")/i,
  /(1=1)/i,
  /(1 = 1)/i,
  /(\bOR\b.*\d+.*=.*\d+)/i,
];

// XSS patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi,
  /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
  /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /javascript:/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /<[^>]*on\w+\s*=.*>/gi,
  /expression\s*\(/gi,
  /url\s*\(/gi,
  /@import/gi,
];

// Command injection patterns
const COMMAND_INJECTION_PATTERNS = [
  /[;&|`$(){}[\]]/,
  /\.\.\//,
  /~\//,
  /\/etc\//,
  /\/proc\//,
  /\/dev\//,
  /\bcat\b/i,
  /\bls\b/i,
  /\bpwd\b/i,
  /\bwhoami\b/i,
  /\bps\b/i,
  /\bkill\b/i,
  /\brm\b/i,
  /\bmv\b/i,
  /\bcp\b/i,
  /\bchmod\b/i,
  /\bchown\b/i,
  /\bcurl\b/i,
  /\bwget\b/i,
  /\bnc\b/i,
  /\bnetcat\b/i,
];

// NoSQL injection patterns
const NOSQL_INJECTION_PATTERNS = [
  /\$where/i,
  /\$ne/i,
  /\$gt/i,
  /\$gte/i,
  /\$lt/i,
  /\$lte/i,
  /\$regex/i,
  /\$in/i,
  /\$nin/i,
  /\$exists/i,
  /\$type/i,
  /\$mod/i,
  /\$all/i,
  /\$size/i,
  /\$elemMatch/i,
];

// Validation schemas
const emailSchema = z.string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .refine(val => !val.includes('..'), 'Invalid email format')
  .refine(val => !/[<>'";&|`${}[\]]/.test(val), 'Email contains invalid characters');

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/\d/, 'Password must contain number')
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain special character')
  .refine(val => !/\s/.test(val), 'Password cannot contain spaces');

const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters')
  .refine(val => !/<[^>]*>/.test(val), 'Name cannot contain HTML')
  .refine(val => !/[;&|`${}[\]]/.test(val), 'Name contains invalid characters');

const textSchema = z.string()
  .max(10000, 'Text too long')
  .refine(val => !detectSQLInjection(val), 'Text contains suspicious patterns')
  .refine(val => !detectXSS(val), 'Text contains XSS patterns')
  .refine(val => !detectCommandInjection(val), 'Text contains command injection patterns');

// Detection functions
function detectSQLInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

function detectXSS(input: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

function detectCommandInjection(input: string): boolean {
  return COMMAND_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

function detectNoSQLInjection(input: string): boolean {
  return NOSQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

// Enhanced sanitization
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;&|`${}[\]]/g, '') // Remove shell metacharacters
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/data:text\/html/gi, '') // Remove data URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/expression\s*\(/gi, '') // Remove CSS expressions
      .substring(0, 10000); // Limit length
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = Array.isArray(input) ? [] : {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Deep validation function
function validateValue(value: any, schema: z.ZodSchema): { isValid: boolean; error?: string; sanitized?: any } {
  try {
    // First sanitize
    const sanitized = sanitizeInput(value);
    
    // Then validate
    const result = schema.parse(sanitized);
    return { isValid: true, sanitized: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.issues[0].message };
    }
    return { isValid: false, error: 'Validation failed' };
  }
}

// Generic validation middleware
export function validateRequest(schema: Record<string, z.ZodSchema>) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json().catch(() => ({}));
      const query = Object.fromEntries(new URL(c.req.url).searchParams.entries());
      const params = c.req.param();
      
      const data = { ...body, ...query, ...params };
      const errors: Record<string, string> = {};
      const sanitizedData: Record<string, any> = {};
      
      // Validate each field
      for (const [field, fieldSchema] of Object.entries(schema)) {
        const validation = validateValue(data[field], fieldSchema);
        
        if (!validation.isValid) {
          errors[field] = validation.error!;
        } else {
          sanitizedData[field] = validation.sanitized;
        }
      }
      
      if (Object.keys(errors).length > 0) {
        console.warn(`[SECURITY] Validation failed for ${c.req.path}:`, errors);
        return c.json({
          success: false,
          error: 'Validation failed',
          details: errors,
        }, 400);
      }
      
      // Attach sanitized data to context
      c.set('validatedData', sanitizedData);
      await next();
      
    } catch (error) {
      console.error(`[SECURITY] Validation middleware error:`, error);
      return c.json({
        success: false,
        error: 'Request validation failed',
      }, 400);
    }
  };
}

// Specific validation middleware
export const validateAuthRequest = validateRequest({
  email: emailSchema,
  password: passwordSchema,
});

export const validateSignupRequest = validateRequest({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const validateTextInput = validateRequest({
  text: textSchema,
});

export const validateUserUpdate = validateRequest({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
});

// Security scanning middleware
export function securityScan() {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.text().catch(() => '');
      const url = c.req.url;
      const userAgent = c.req.header('User-Agent') || '';
      
      // Check for common attack patterns
      const attackPatterns = [
        ...SQL_INJECTION_PATTERNS,
        ...XSS_PATTERNS,
        ...COMMAND_INJECTION_PATTERNS,
        ...NOSQL_INJECTION_PATTERNS,
      ];
      
      const suspiciousContent = [body, url, userAgent].join(' ');
      
      for (const pattern of attackPatterns) {
        if (pattern.test(suspiciousContent)) {
          const clientIP = c.req.header('x-forwarded-for') || 
                           c.req.header('x-real-ip') || 
                           '127.0.0.1';
          
          console.error(`[SECURITY] Attack detected from ${clientIP}: ${pattern.source}`);
          
          return c.json({
            success: false,
            error: 'Security violation detected',
          }, 403);
        }
      }
      
      await next();
      
    } catch (error) {
      console.error(`[SECURITY] Security scan error:`, error);
      await next(); // Continue on scan error
    }
  };
}

// File upload validation
export function validateFileUpload(options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
} = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles = 1,
  } = options;
  
  return async (c: Context, next: Next) => {
    try {
      // File validation would go here
      // This is a simplified version
      const contentLength = c.req.header('Content-Length');
      
      if (contentLength && parseInt(contentLength) > maxSize) {
        return c.json({
          success: false,
          error: 'File too large',
          maxSize,
        }, 413);
      }
      
      await next();
      
    } catch (error) {
      console.error(`[SECURITY] File validation error:`, error);
      return c.json({
        success: false,
        error: 'File validation failed',
      }, 400);
    }
  };
}

// Export validation schemas for reuse
export { emailSchema, passwordSchema, nameSchema, textSchema };

// Export detection functions
export { detectSQLInjection, detectXSS, detectCommandInjection, detectNoSQLInjection, sanitizeInput };