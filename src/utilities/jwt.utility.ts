import jwt from 'jsonwebtoken';

/**
 * JWT Utility class for token generation and verification
 */
export default class JwtUtility {
  // JWT Secret Keys (use environment variables in production)
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_12345';
  private static readonly REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_super_secret_refresh_key_change_this_in_production_12345';
  
  // Token expiration times
  private static readonly ACCESS_TOKEN_EXPIRY = '1d'; // 1 day (24 hours)
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  /**
   * Generate access token (short-lived, 1 day)
   * @param payload - Data to encode in token
   * @returns JWT access token string
   */
  static generateAccessToken(payload: any): string {
    try {
      const token = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        algorithm: 'HS256'
      });
      
      console.log('✅ Access token generated successfully');
      return token;
    } catch (error) {
      console.error('❌ Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token (long-lived, 7 days)
   * @param payload - Data to encode in token
   * @returns JWT refresh token string
   */
  static generateRefreshToken(payload: any): string {
    try {
      const token = jwt.sign(payload, this.REFRESH_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        algorithm: 'HS256'
      });
      
      console.log('✅ Refresh token generated successfully');
      return token;
    } catch (error) {
      console.error('❌ Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Verify access token
   * @param token - JWT access token to verify
   * @returns Decoded payload if valid
   * @throws Error with specific message for expired vs invalid tokens
   */
  static verifyAccessToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        algorithms: ['HS256']
      });
      
      console.log('✅ Access token verified successfully');
      return decoded;
    } catch (error: any) {
      console.error('❌ Error verifying access token:', error.message);
      
      // Distinguish between expired and invalid tokens
      if (error.name === 'TokenExpiredError') {
        throw new Error('TOKEN_EXPIRED');
      }
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   * @param token - JWT refresh token to verify
   * @returns Decoded payload if valid
   */
  static verifyRefreshToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.REFRESH_SECRET, {
        algorithms: ['HS256']
      });
      
      console.log('✅ Refresh token verified successfully');
      return decoded;
    } catch (error) {
      console.error('❌ Error verifying refresh token:', error);
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Generate JWT token (deprecated - use generateAccessToken instead)
   * @param payload - Data to encode in token
   * @returns JWT token string
   */
  static generateToken(payload: any): string {
    return this.generateAccessToken(payload);
  }

  /**
   * Verify JWT token (deprecated - use verifyAccessToken instead)
   * @param token - JWT token to verify
   * @returns Decoded payload if valid
   */
  static verifyToken(token: string): any {
    return this.verifyAccessToken(token);
  }

  /**
   * Decode JWT token without verification (for debugging)
   * @param token - JWT token to decode
   * @returns Decoded payload
   */
  static decodeToken(token: string): any {
    try {
      const decoded = jwt.decode(token);
      return decoded;
    } catch (error) {
      console.error('❌ Error decoding JWT token:', error);
      throw new Error('Failed to decode JWT token');
    }
  }

  /**
   * Create login token payload
   * @param userId - User ID
   * @param loginID - User login ID (email)
   * @param roleID - User role ID
   * @returns Token payload
   */
  static createLoginPayload(userId: number, loginID: string, roleID: number): any {
    return {
      id: userId,
      loginID: loginID,
      roleID: roleID,
      iat: Math.floor(Date.now() / 1000),
      type: 'login'
    };
  }

  /**
   * Get access token expiry time in seconds
   * @returns Expiry time in seconds (86400 = 1 day / 24 hours)
   */
  static getAccessTokenExpirySeconds(): number {
    return 24 * 60 * 60; // 1 day (24 hours)
  }

  /**
   * Get refresh token expiry time in seconds
   * @returns Expiry time in seconds (604800 = 7 days)
   */
  static getRefreshTokenExpirySeconds(): number {
    return 7 * 24 * 60 * 60; // 7 days
  }

  /**
   * Get token expiry time in seconds (deprecated - use getAccessTokenExpirySeconds)
   * @returns Expiry time in seconds
   */
  static getTokenExpirySeconds(): number {
    return this.getAccessTokenExpirySeconds();
  }

  /**
   * Get token expiry time in milliseconds (deprecated - use getAccessTokenExpirySeconds)
   * @returns Expiry time in milliseconds
   */
  static getTokenExpiryMs(): number {
    return this.getAccessTokenExpirySeconds() * 1000;
  }
}
