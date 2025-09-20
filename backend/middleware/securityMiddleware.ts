import { Context, Next } from 'hono';

// Simple IP extraction function
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

// Security headers middleware
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    // Security headers
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Remove server identification
    c.header('Server', '');
    
    await next();
  };
}

// Request logging middleware
export function requestLogger() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    const clientIP = getClientIP(c) || 'unknown';
    const userAgent = c.req.header('User-Agent') || 'unknown';
    
    await next();
    
    const duration = Date.now() - start;
    const status = c.res.status;
    
    // Log suspicious activity
    if (status === 429 || status >= 400) {
      console.warn(`[SECURITY] ${clientIP} - ${c.req.method} ${c.req.path} - ${status} - ${duration}ms - ${userAgent}`);
    } else {
      console.log(`[REQUEST] ${clientIP} - ${c.req.method} ${c.req.path} - ${status} - ${duration}ms`);
    }
  };
}

// IP whitelist/blacklist middleware
const blockedIPs = new Set<string>();
const suspiciousIPs = new Set<string>();

export function ipFilter() {
  return async (c: Context, next: Next) => {
    const clientIP = getClientIP(c);
    
    if (!clientIP) {
      return c.json({ error: 'Unable to determine client IP' }, 400);
    }
    
    // Check if IP is blocked
    if (blockedIPs.has(clientIP)) {
      console.warn(`[SECURITY] Blocked IP attempted access: ${clientIP}`);
      return c.json({ error: 'Access denied' }, 403);
    }
    
    // Check if IP is suspicious (multiple rate limit violations)
    if (suspiciousIPs.has(clientIP)) {
      console.warn(`[SECURITY] Suspicious IP attempted access: ${clientIP}`);
      // Allow but log
    }
    
    await next();
  };
}

// Function to block an IP (can be called from rate limiter)
export function blockIP(ip: string, reason: string) {
  blockedIPs.add(ip);
  console.warn(`[SECURITY] IP blocked: ${ip} - Reason: ${reason}`);
  
  // Auto-unblock after 24 hours
  setTimeout(() => {
    blockedIPs.delete(ip);
    console.log(`[SECURITY] IP unblocked: ${ip}`);
  }, 24 * 60 * 60 * 1000);
}

// Function to mark IP as suspicious
export function markSuspiciousIP(ip: string, reason: string) {
  suspiciousIPs.add(ip);
  console.warn(`[SECURITY] IP marked as suspicious: ${ip} - Reason: ${reason}`);
  
  // Auto-remove from suspicious list after 1 hour
  setTimeout(() => {
    suspiciousIPs.delete(ip);
    console.log(`[SECURITY] IP removed from suspicious list: ${ip}`);
  }, 60 * 60 * 1000);
}

// Request size limiter
export function requestSizeLimit(maxSize: number = 1024 * 1024) { // 1MB default
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('Content-Length');
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return c.json({ error: 'Request too large' }, 413);
    }
    
    await next();
  };
}

// CORS security configuration
export const secureCorsOptions = {
  origin: (origin: string) => {
    // In production, specify allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://yourdomain.com',
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return origin;
    
    return allowedOrigins.includes(origin) ? origin : null;
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
