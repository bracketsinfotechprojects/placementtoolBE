import { getRepository } from 'typeorm';

// Entities
import { User } from '../../entities/user/user.entity';

// Utilities
import PasswordUtility from '../../utilities/password.utility';
import JwtUtility from '../../utilities/jwt.utility';
import ApiUtility from '../../utilities/api.utility';

// Errors
import { StringError } from '../../errors/string.error';

/**
 * Login request interface
 */
export interface ILoginRequest {
  loginID: string;
  password: string;
}

/**
 * Login response interface
 */
export interface ILoginResponse {
  user: {
    id: number;
    loginID: string;
    roleID: number;
    status: string;
  };
  token: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * User login
 * @param loginID - Email or username
 * @param password - Plain text password
 * @returns Login response with JWT token
 */
const login = async (loginID: string, password: string): Promise<ILoginResponse> => {
  try {
    console.log('🔐 Login attempt for:', loginID);

    // Validate input
    if (!loginID || !password) {
      throw new StringError('Email and password are required');
    }

    // Find user by loginID
    const user = await getRepository(User).findOne({
      where: { loginID }
    });

    if (!user) {
      console.log('❌ User not found:', loginID);
      throw new StringError('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      console.log('❌ User account is not active:', loginID);
      throw new StringError('User account is not active');
    }

    // Verify password
    const isPasswordValid = await PasswordUtility.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', loginID);
      throw new StringError('Invalid email or password');
    }

    // Generate JWT token
    const tokenPayload = JwtUtility.createLoginPayload(user.id, user.loginID, user.roleID);
    const token = JwtUtility.generateToken(tokenPayload);

    console.log('✅ Login successful for user:', loginID);

    // Return response
    const response: ILoginResponse = {
      user: {
        id: user.id,
        loginID: user.loginID,
        roleID: user.roleID,
        status: user.status
      },
      token: token,
      expiresIn: JwtUtility.getTokenExpirySeconds(),
      tokenType: 'Bearer'
    };

    return response;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
};

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 */
const verifyToken = async (token: string): Promise<any> => {
  try {
    console.log('🔍 Verifying JWT token...');

    if (!token) {
      throw new StringError('Token is required');
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    // Verify token
    const decoded = JwtUtility.verifyToken(cleanToken);

    console.log('✅ Token verified successfully');
    return decoded;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    throw new StringError('Invalid or expired token');
  }
};

/**
 * Refresh JWT token
 * @param token - Current JWT token
 * @returns New JWT token
 */
const refreshToken = async (token: string): Promise<string> => {
  try {
    console.log('🔄 Refreshing JWT token...');

    // Verify current token
    const decoded = await verifyToken(token);

    // Generate new token with same payload
    const newToken = JwtUtility.generateToken({
      id: decoded.id,
      loginID: decoded.loginID,
      roleID: decoded.roleID,
      type: 'login'
    });

    console.log('✅ Token refreshed successfully');
    return newToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);
    throw error;
  }
};

/**
 * Logout (invalidate token on client side)
 * Note: JWT tokens are stateless, so logout is handled on client side
 */
const logout = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('👋 User logged out');
    return {
      success: true,
      message: 'Logged out successfully. Please remove the token from client.'
    };
  } catch (error) {
    console.error('❌ Logout failed:', error.message);
    throw error;
  }
};

export default {
  login,
  verifyToken,
  refreshToken,
  logout
};
