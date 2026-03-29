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
    role: string;
    status: string;
    studentID?: number;
    facilityID?: number;
    supervisorID?: number;
    placementExecutiveID?: number;
    trainerID?: number;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Get role name from roleID
 * @param roleID - Role ID
 * @returns Role name
 */
const getRoleName = (roleID: number): string => {
  const roleMap: { [key: number]: string } = {
    1: 'admin',
    2: 'facility',
    3: 'supervisor',
    4: 'placement_executive',
    5: 'trainer',
    6: 'student'
  };
  return roleMap[roleID] || 'unknown';
};

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

    // First, check if user exists (including deleted users)
    const userExists = await getRepository(User).findOne({
      where: { loginID }
    });

    // If user exists but is deleted, give specific message
    if (userExists && userExists.isDeleted) {
      console.log('❌ User account is deactivated:', loginID);
      throw new StringError('Your account has been deactivated. Please contact support for assistance.');
    }

    // Find active user by loginID
    const user = await getRepository(User).findOne({
      where: { loginID, isDeleted: false }
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

    // Generate JWT tokens
    const tokenPayload = JwtUtility.createLoginPayload(user.id, user.loginID, user.roleID);
    const accessToken = JwtUtility.generateAccessToken(tokenPayload);
    const refreshToken = JwtUtility.generateRefreshToken(tokenPayload);

    console.log('✅ Login successful for user:', loginID);

    // Prepare user response with role-specific ID
    const userResponse: any = {
      id: user.id,
      loginID: user.loginID,
      roleID: user.roleID,
      role: getRoleName(user.roleID),
      status: user.status
    };

    // Add role-specific ID based on roleID
    switch (user.roleID) {
      case 6: // Student
        if (user.studentID) userResponse.studentID = user.studentID;
        break;
      case 2: // Facility
        if (user.facilityID) userResponse.facilityID = user.facilityID;
        break;
      case 3: // Supervisor
        if (user.supervisorID) userResponse.supervisorID = user.supervisorID;
        break;
      case 4: // Placement Executive
        if (user.placementExecutiveID) userResponse.placementExecutiveID = user.placementExecutiveID;
        break;
      case 5: // Trainer
        if (user.trainerID) userResponse.trainerID = user.trainerID;
        break;
    }

    // Return response
    const response: ILoginResponse = {
      user: userResponse,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresIn: JwtUtility.getAccessTokenExpirySeconds(),
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
 * Refresh JWT access token using refresh token
 * @param refreshToken - Current refresh token
 * @returns New access token
 */
const refreshToken = async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
  try {
    console.log('🔄 Refreshing access token...');

    if (!refreshToken) {
      throw new StringError('Refresh token is required');
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = refreshToken.startsWith('Bearer ') ? refreshToken.slice(7) : refreshToken;

    // Verify refresh token
    const decoded = JwtUtility.verifyRefreshToken(cleanToken);

    // Generate new access token with same payload
    const newAccessToken = JwtUtility.generateAccessToken({
      id: decoded.id,
      loginID: decoded.loginID,
      roleID: decoded.roleID,
      type: 'login'
    });

    console.log('✅ Access token refreshed successfully');
    return {
      accessToken: newAccessToken,
      expiresIn: JwtUtility.getAccessTokenExpirySeconds()
    };
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
