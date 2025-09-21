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

// Security headers middleware - ENHANCED
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    // Enhanced security headers
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), clipboard-read=(), clipboard-write=()');
    
    // ENHANCED Content Security Policy (CSP) - MORE RESTRICTIVE
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", 
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' blob:",
      "connect-src 'self' https://api.elevenlabs.io https://texttospeech.googleapis.com https://firestore.googleapis.com wss: ws:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
      "block-all-mixed-content"
    ];
    c.header('Content-Security-Policy', cspDirectives.join('; '));
    
    // Strict Transport Security (HTTPS only) - ENHANCED
    if (c.req.header('x-forwarded-proto') === 'https' || c.req.url.startsWith('https:')) {
      c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'); // 2 years
    }
    
    // Additional security headers
    c.header('X-DNS-Prefetch-Control', 'off'); // Disable DNS prefetching
    c.header('X-Download-Options', 'noopen'); // Prevent file downloads from opening
    c.header('X-Permitted-Cross-Domain-Policies', 'none'); // Block Adobe Flash/PDF policies
    c.header('Cross-Origin-Embedder-Policy', 'require-corp'); // Isolate from cross-origin
    c.header('Cross-Origin-Opener-Policy', 'same-origin'); // Isolate browsing context
    c.header('Cross-Origin-Resource-Policy', 'same-site'); // Restrict resource loading
    
    // Cache control for security
    c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    c.header('Pragma', 'no-cache');
    c.header('Expires', '0');
    
    // Remove server identification - ENHANCED
    c.header('Server', '');
    c.header('X-Powered-By', '');
    c.header('X-AspNet-Version', '');
    c.header('X-AspNetMvc-Version', '');
    
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

// Request size limiter - ENHANCED
export function requestSizeLimit(maxSize: number = 512 * 1024) { // REDUCED: 512KB default (was 1MB)
  return async (c: Context, next: Next) => {
    const contentLength = c.req.header('Content-Length');
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      console.warn(`[SECURITY] Request too large: ${contentLength} bytes (limit: ${maxSize})`);
      return c.json({ 
        success: false,
        error: 'Request payload too large',
        maxSize,
        received: parseInt(contentLength),
      }, 413);
    }
    
    await next();
  };
}

// Additional security middleware

// Request method validation
export function validateRequestMethod(allowedMethods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']) {
  return async (c: Context, next: Next) => {
    const method = c.req.method;
    
    if (!allowedMethods.includes(method)) {
      console.warn(`[SECURITY] Invalid HTTP method: ${method}`);
      return c.json({ error: 'Method not allowed' }, 405);
    }
    
    await next();
  };
}

// Content-Type validation for POST/PUT requests
export function validateContentType() {
  return async (c: Context, next: Next) => {
    const method = c.req.method;
    const contentType = c.req.header('Content-Type');
    
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`[SECURITY] Invalid content type: ${contentType} for method: ${method}`);
        return c.json({ error: 'Content-Type must be application/json' }, 415);
      }
    }
    
    await next();
  };
}

// Request timeout middleware
export function requestTimeout(timeoutMs: number = 30000) { // 30 seconds default
  return async (c: Context, next: Next) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeoutMs);
    });
    
    try {
      await Promise.race([next(), timeoutPromise]);
    } catch (error) {
      if ((error as Error).message === 'Request timeout') {
        console.warn(`[SECURITY] Request timeout: ${c.req.method} ${c.req.path}`);
        return c.json({ error: 'Request timeout' }, 408);
      }
      throw error;
    }
  };
}

// CORS security configuration - HARDENED (Hono compatible)
export const secureCorsOptions = {
  origin: (origin: string) => {
    // Define allowed origins from environment variables for security
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.FRONTEND_URL_DEV || 'http://localhost:3001',
      process.env.FRONTEND_URL_STAGING,
      process.env.FRONTEND_URL_PRODUCTION,
      'http://localhost:8081', // React Native development
      'exp://localhost:8081', // Expo development
    ].filter(Boolean); // Remove undefined values
    
    // SECURITY FIX: Reject requests with no origin header (was allowing all)
    if (!origin) {
      console.warn('[SECURITY] CORS: Request with no origin header rejected');
      return null; // Reject
    }
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.includes(origin);
    
    if (!isAllowed) {
      console.warn(`[SECURITY] CORS: Blocked origin: ${origin}`);
      return null; // Reject
    }
    
    console.log(`[SECURITY] CORS: Allowed origin: ${origin}`);
    return origin; // Allow
  },
  credentials: true, // Allow credentials but with strict origin checking
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicit allowed methods
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ], // Restricted headers
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ], // Only expose necessary headers
  maxAge: 300, // 5 minutes cache for preflight requests
};
