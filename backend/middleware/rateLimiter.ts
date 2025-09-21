import { Context, Next } from 'hono';
import { blockIP, markSuspiciousIP } from './securityMiddleware';

// Simple IP extraction function since getClientIP might not be available
function getClientIP(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  const realIP = c.req.header('x-real-ip');
  const remoteAddr = c.req.header('x-remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (remoteAddr) {
    return remoteAddr;
  }
  
  return '127.0.0.1'; // fallback
}

// In-memory store for rate limiting (in production, use Redis or similar)
interface RateLimitEntry {
  count: number;
  resetTime: number;
  violations: number; // Track total violations for progressive limiting
  lastViolation: number; // Timestamp of last violation
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Progressive lockout tracking
interface LockoutEntry {
  lockedUntil: number;
  violationCount: number;
  escalationLevel: number; // 0 = warning, 1 = short lock, 2 = long lock, 3 = permanent
}

const lockoutStore = new Map<string, LockoutEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  // Also clean up expired lockouts
  for (const [key, lockout] of Array.from(lockoutStore.entries())) {
    if (now > lockout.lockedUntil) {
      lockoutStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Progressive lockout calculation
function calculateLockoutDuration(violations: number): number {
  if (violations <= 2) return 0; // No lockout for first 2 violations
  if (violations <= 5) return 15 * 60 * 1000; // 15 minutes
  if (violations <= 10) return 60 * 60 * 1000; // 1 hour
  if (violations <= 20) return 6 * 60 * 60 * 1000; // 6 hours
  return 24 * 60 * 60 * 1000; // 24 hours for severe violations
}

// Update lockout status with escalation
function updateLockoutStatus(clientIP: string, lockoutDuration: number, violations: number): void {
  const now = Date.now();
  let escalationLevel = 0;
  
  if (violations > 20) escalationLevel = 3; // Permanent (requires manual review)
  else if (violations > 10) escalationLevel = 2; // Long lock
  else if (violations > 5) escalationLevel = 1; // Short lock
  
  const lockoutEntry: LockoutEntry = {
    lockedUntil: now + lockoutDuration,
    violationCount: violations,
    escalationLevel,
  };
  
  lockoutStore.set(clientIP, lockoutEntry);
  
  console.warn(`[SECURITY] Progressive lockout applied: ${clientIP} - Duration: ${lockoutDuration/60000}min - Level: ${escalationLevel} - Violations: ${violations}`);
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimit(config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    const clientIP = getClientIP(c) || 'unknown';
    const now = Date.now();
    const key = `${clientIP}:${c.req.path}`;
    
    // Check for active lockout first
    const lockoutEntry = lockoutStore.get(clientIP);
    if (lockoutEntry && now < lockoutEntry.lockedUntil) {
      const retryAfter = Math.ceil((lockoutEntry.lockedUntil - now) / 1000);
      return c.json({
        success: false,
        error: 'Account temporarily locked due to security violations',
        retryAfter,
        escalationLevel: lockoutEntry.escalationLevel,
      }, 429, {
        'Retry-After': retryAfter.toString(),
        'X-Security-Level': lockoutEntry.escalationLevel.toString(),
      });
    }
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        violations: entry?.violations || 0,
        lastViolation: entry?.lastViolation || 0,
      };
      rateLimitStore.set(key, entry);
    }
    
    // Increment request count
    entry.count++;
    
    // Check if limit exceeded
    if (entry.count > config.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      // Update violation tracking
      entry.violations++;
      entry.lastViolation = now;
      
      // Implement progressive lockout
      const lockoutDuration = calculateLockoutDuration(entry.violations);
      if (lockoutDuration > 0) {
        updateLockoutStatus(clientIP, lockoutDuration, entry.violations);
      }
      
      // Mark IP as suspicious for repeated violations
      if (entry.count > config.max * 2) {
        markSuspiciousIP(clientIP, `Rate limit exceeded by ${entry.count - config.max} requests`);
      }
      
      // Block IP for extreme violations (more than 3x the limit)
      if (entry.count > config.max * 3) {
        blockIP(clientIP, `Extreme rate limit violation: ${entry.count} requests (limit: ${config.max})`);
      }
      
      return c.json({
        success: false,
        error: config.message || 'Too many requests',
        retryAfter,
        limit: config.max,
        remaining: 0,
        resetTime: entry.resetTime,
        violations: entry.violations,
      }, 429, {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': config.max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': entry.resetTime.toString(),
        'X-Violations': entry.violations.toString(),
      });
    }
    
    // Add rate limit headers
    c.header('X-RateLimit-Limit', config.max.toString());
    c.header('X-RateLimit-Remaining', (config.max - entry.count).toString());
    c.header('X-RateLimit-Reset', entry.resetTime.toString());
    
    await next();
  };
}

// Pre-configured rate limiters for different auth operations - HARDENED SECURITY
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // REDUCED: 3 attempts per 15 minutes (was 5)
  message: 'Too many authentication attempts. Account temporarily locked.',
});

export const signinRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // REDUCED: 3 signin attempts per 15 minutes (was 5)
  message: 'Too many signin attempts. Please try again in 15 minutes.',
});

export const signupRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2, // REDUCED: 2 signup attempts per hour (was 3)
  message: 'Too many signup attempts. Please try again in 1 hour.',
});

export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2, // REDUCED: 2 password reset attempts per hour (was 3)
  message: 'Too many password reset attempts. Please try again later.',
});

// General API rate limiter - SIGNIFICANTLY REDUCED
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // REDUCED: 50 requests per 15 minutes (was 100)
  message: 'Rate limit exceeded. Please slow down your requests.',
});

// Strict rate limiter for sensitive operations
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // REDUCED: 5 attempts per hour (was 10)
  message: 'Rate limit exceeded for sensitive operations.',
});

// ADDITIONAL SECURITY RATE LIMITERS

// Ultra-strict rate limiter for admin operations
export const adminRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 admin operations per hour
  message: 'Admin operation rate limit exceeded.',
});

// Very strict rate limiter for failed login attempts
export const failedLoginRateLimit = createRateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 2, // Only 2 failed login attempts per 30 minutes
  message: 'Too many failed login attempts. Account temporarily locked.',
});

// API endpoint protection for sensitive data access
export const sensitiveDataRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 sensitive data requests per hour
  message: 'Too many requests for sensitive data.',
});

// Rate limiter for account modification operations
export const accountModificationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 account modifications per hour
  message: 'Too many account modification attempts.',
});
