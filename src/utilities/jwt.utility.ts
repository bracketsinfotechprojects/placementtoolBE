import jwt from 'jsonwebtoken';

/**
 * JWT Utility class for token generation and verification
 */
export default class JwtUtility {
  // JWT Secret Key (generate a strong secret in production)
  private static readonly JWT_SECRET = 'your_super_secret_jwt_key_change_this_in_production_12345';
  
  // Token expiration time (24 hours)
  private static readonly TOKEN_EXPIRY = '24h';

  /**
   * Generate JWT token
   * @param payload - Data to encode in token
   * @returns JWT token string
   */
  static generateToken(payload: any): string {
    try {
      const token = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.TOKEN_EXPIRY,
        algorithm: 'HS256'
      });
      
      console.log('✅ JWT token generated successfully');
      return token;
    } catch (error) {
      console.error('❌ Error generating JWT token:', error);
      throw new Error('Failed to generate JWT token');
    }
  }

  /**
   * Verify JWT token
   * @param token - JWT token to verify
   * @returns Decoded payload if valid
   */
  static verifyToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        algorithms: ['HS256']
      });
      
      console.log('✅ JWT token verified successfully');
      return decoded;
    } catch (error) {
      console.error('❌ Error verifying JWT token:', error);
      throw new Error('Invalid or expired JWT token');
    }
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
   * Get token expiry time in seconds
   * @returns Expiry time in seconds
   */
  static getTokenExpirySeconds(): number {
    // 24 hours = 86400 seconds
    return 24 * 60 * 60;
  }

  /**
   * Get token expiry time in milliseconds
   * @returns Expiry time in milliseconds
   */
  static getTokenExpiryMs(): number {
    return this.getTokenExpirySeconds() * 1000;
  }
}
