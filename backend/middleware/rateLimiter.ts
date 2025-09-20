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
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

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
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      rateLimitStore.set(key, entry);
    }
    
    // Increment request count
    entry.count++;
    
    // Check if limit exceeded
    if (entry.count > config.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
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
      }, 429, {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': config.max.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': entry.resetTime.toString(),
      });
    }
    
    // Add rate limit headers
    c.header('X-RateLimit-Limit', config.max.toString());
    c.header('X-RateLimit-Remaining', (config.max - entry.count).toString());
    c.header('X-RateLimit-Reset', entry.resetTime.toString());
    
    await next();
  };
}

// Pre-configured rate limiters for different auth operations
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again later.',
});

export const signinRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 signin attempts per 15 minutes
  message: 'Too many signin attempts. Please try again later.',
});

export const signupRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 signup attempts per hour
  message: 'Too many signup attempts. Please try again later.',
});

export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts. Please try again later.',
});

// General API rate limiter
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests. Please slow down.',
});

// Strict rate limiter for sensitive operations
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: 'Rate limit exceeded for sensitive operations.',
});
