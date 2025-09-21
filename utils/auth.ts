/**
 * Secure Authentication Utilities
 * Provides cryptographically secure token generation and validation
 * Following security best practices and user specifications
 */

import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

// Secure token configuration
interface TokenConfig {
  secret: string;
  expiresIn: number; // seconds
  algorithm: string;
  issuer: string;
}

// Token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
  iat: number; // issued at
  exp: number; // expires at
  iss: string; // issuer
  jti: string; // JWT ID (unique token identifier)
}

// Authentication result interface
export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    lastLoginAt: string;
  };
  token?: string;
  error?: string;
  field?: string;
}

/**
 * Secure JWT Token Generator
 * Uses cryptographically secure methods instead of predictable timestamps
 */
export class SecureTokenGenerator {
  private config: TokenConfig;

  constructor() {
    // Load JWT secret from environment variables
    const jwtSecret = process.env.JWT_SECRET || process.env.EXPO_PUBLIC_JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required for secure token generation');
    }

    if (jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long for security');
    }

    this.config = {
      secret: jwtSecret,
      expiresIn: 24 * 60 * 60, // 24 hours
      algorithm: 'HS256',
      issuer: 'linguapp-auth',
    };
  }

  /**
   * Generate a cryptographically secure JWT token
   * Uses random bytes and HMAC for security instead of predictable timestamps
   */
  generateSecureToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'jti'>): string {
    const now = Math.floor(Date.now() / 1000);
    
    // Generate cryptographically secure unique token identifier
    const jti = this.generateSecureJTI();
    
    const fullPayload: TokenPayload = {
      ...payload,
      iat: now,
      exp: now + this.config.expiresIn,
      iss: this.config.issuer,
      jti,
    };

    // Create JWT header
    const header = {
      alg: this.config.algorithm,
      typ: 'JWT',
    };

    // Encode header and payload
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(fullPayload));
    
    // Create signature using HMAC
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const signature = this.createHmacSignature(dataToSign);
    
    // Return complete JWT
    return `${dataToSign}.${signature}`;
  }

  /**
   * Generate a cryptographically secure unique identifier for JWT
   */
  private generateSecureJTI(): string {
    // Use crypto.randomBytes for secure random generation
    const randomData = randomBytes(16);
    const timestamp = Date.now();
    
    // Combine random bytes with timestamp and hash for uniqueness
    const combined = Buffer.concat([
      randomData,
      Buffer.from(timestamp.toString(), 'utf8'),
    ]);
    
    // Create hash of combined data
    const hash = createHmac('sha256', this.config.secret)
      .update(combined)
      .digest('hex');
    
    return hash.substring(0, 32); // 32 character unique identifier
  }

  /**
   * Create HMAC signature for JWT
   */
  private createHmacSignature(data: string): string {
    return createHmac('sha256', this.config.secret)
      .update(data)
      .digest('base64url');
  }

  /**
   * Base64 URL encode (JWT standard)
   */
  private base64UrlEncode(data: string): string {
    return Buffer.from(data, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): { valid: boolean; payload?: TokenPayload; error?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const [encodedHeader, encodedPayload, signature] = parts;
      
      // Verify signature
      const dataToVerify = `${encodedHeader}.${encodedPayload}`;
      const expectedSignature = this.createHmacSignature(dataToVerify);
      
      // Use timing-safe comparison to prevent timing attacks
      const signatureBuffer = Buffer.from(signature, 'base64url');
      const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
      
      if (signatureBuffer.length !== expectedBuffer.length) {
        return { valid: false, error: 'Invalid signature' };
      }

      if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
        return { valid: false, error: 'Invalid signature' };
      }

      // Decode payload
      const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
      const payload: TokenPayload = JSON.parse(payloadJson);

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return { valid: false, error: 'Token expired' };
      }

      // Check issuer
      if (payload.iss !== this.config.issuer) {
        return { valid: false, error: 'Invalid issuer' };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: 'Token verification failed' };
    }
  }

  /**
   * Generate a secure session token (shorter lived)
   */
  generateSessionToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'jti'>): string {
    // Temporarily reduce expiration for session tokens
    const originalExpiry = this.config.expiresIn;
    this.config.expiresIn = 2 * 60 * 60; // 2 hours for sessions
    
    const token = this.generateSecureToken(payload);
    
    // Restore original expiry
    this.config.expiresIn = originalExpiry;
    
    return token;
  }

  /**
   * Generate a secure refresh token (longer lived)
   */
  generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'jti'>): string {
    // Temporarily increase expiration for refresh tokens
    const originalExpiry = this.config.expiresIn;
    this.config.expiresIn = 7 * 24 * 60 * 60; // 7 days for refresh tokens
    
    const token = this.generateSecureToken(payload);
    
    // Restore original expiry
    this.config.expiresIn = originalExpiry;
    
    return token;
  }
}

/**
 * Utility functions for secure authentication
 */

// Singleton instance for consistent token generation
let tokenGenerator: SecureTokenGenerator | null = null;

/**
 * Get or create secure token generator instance
 */
function getTokenGenerator(): SecureTokenGenerator {
  if (!tokenGenerator) {
    tokenGenerator = new SecureTokenGenerator();
  }
  return tokenGenerator;
}

/**
 * Generate a secure authentication token
 * Replaces insecure timestamp-based generation
 */
export function generateAuthToken(user: {
  id: string;
  email: string;
  name?: string;
}): string {
  const generator = getTokenGenerator();
  return generator.generateSecureToken({
    userId: user.id,
    email: user.email,
    name: user.name || 'User',
  });
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(user: {
  id: string;
  email: string;
  name?: string;
}): string {
  const generator = getTokenGenerator();
  return generator.generateSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name || 'User',
  });
}

/**
 * Verify an authentication token
 */
export function verifyAuthToken(token: string): { valid: boolean; payload?: TokenPayload; error?: string } {
  try {
    const generator = getTokenGenerator();
    return generator.verifyToken(token);
  } catch (error) {
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Create a secure authentication result
 */
export function createAuthResult(
  success: boolean,
  user?: {
    id: string;
    email: string;
    name: string;
  },
  error?: string,
  field?: string
): AuthResult {
  if (success && user) {
    const token = generateAuthToken(user);
    return {
      success: true,
      user: {
        ...user,
        lastLoginAt: new Date().toISOString(),
      },
      token,
    };
  }

  return {
    success: false,
    error: error || 'Authentication failed',
    field: field || 'general',
  };
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureRandomString(length: number = 32): string {
  return randomBytes(Math.ceil(length / 2)).toString('hex').substring(0, length);
}

/**
 * Hash a password securely (for production use with proper salt)
 */
export function hashPassword(password: string, salt?: string): string {
  const actualSalt = salt || generateSecureRandomString(16);
  const hash = createHmac('sha256', actualSalt)
    .update(password)
    .digest('hex');
  return `${actualSalt}:${hash}`;
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const expectedHash = createHmac('sha256', salt)
      .update(password)
      .digest('hex');
    
    // Use timing-safe comparison
    const hashBuffer = Buffer.from(hash, 'hex');
    const expectedBuffer = Buffer.from(expectedHash, 'hex');
    
    return hashBuffer.length === expectedBuffer.length && 
           timingSafeEqual(hashBuffer, expectedBuffer);
  } catch (error) {
    return false;
  }
}

// SecureTokenGenerator is already exported above as a class declaration