import { getRepository } from 'typeorm';

// Entities
import { User } from '../../entities/user/user.entity';

// Services
import RoleService from '../role/role.service';

// Utilities
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';

// Interfaces
import { IDeleteById, IDetailById } from '../../interfaces/common.interface';

// Errors
import { StringError } from '../../errors/string.error';

const baseWhere = { };

// Create User
const create = async (params: ICreateUser) => {
  try {
    // Validate required fields
    if (!params.loginID || !params.password) {
      throw new Error('loginID and password are required');
    }
    
    // Get role ID using centralized RoleService
    const roleId = await RoleService.getRoleIdByName(params.userRole || 'user');
    
    // Validate studentID usage
    if (params.studentID) {
      if (roleId !== 6) {
        throw new Error('studentID can only be provided for Student role users');
      }
    }
    
    // If creating a student user, studentID is required
    if (roleId === 6 && !params.studentID) {
      throw new Error('studentID is required when creating a Student role user');
    }
    
    // Hash the password before storing
    const hashedPassword = await PasswordUtility.hashPassword(params.password);
    
    const user = new User();
    user.loginID = params.loginID;
    user.password = hashedPassword;
    user.roleID = roleId;
    user.studentID = params.studentID || null;
    user.status = params.status || 'active';
    
    console.log('📝 Creating user with data:', {
      loginID: user.loginID,
      roleID: user.roleID,
      studentID: user.studentID,
      status: user.status,
      passwordHashed: true
    });
    
    const userData = await getRepository(User).save(user);
    console.log('✅ User created successfully with ID:', userData.id);
    
    return ApiUtility.sanitizeUser(userData);
  } catch (error) {
    console.error('❌ Error creating user:', {
      loginID: params.loginID,
      userRole: params.userRole,
      error: error.message
    });
    throw error;
  }
};

// Helper function removed - now using RoleService

// User creation interface
export interface ICreateUser {
  loginID: string;
  password: string;
  userRole?: string;
  studentID?: number;
  status?: string;
}

// User update interface
export interface IUpdateUser {
  id: number;
  loginID?: string;
  password?: string;
  userRole?: string;
  studentID?: number;
  status?: string;
}

// User query parameters interface
export interface IUserQueryParams {
  keyword?: string;
  status?: string;
  userRole?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}

// User list response interface
export interface IUserListResponse {
  response: IUserDetail[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// User detail response interface
export interface IUserDetail {
  id: number;
  loginID: string;
  userRole: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Get User by ID
const getById = async (params: IDetailById) => {
  try {
    const data = await getRepository(User).findOne({
      where: { id: params.id },
    });
    return ApiUtility.sanitizeUser(data);
  } catch (e) {
    return null;
  }
};

// Get User Detail (with validation)
const detail = async (params: IDetailById) => {
  const query = { ...baseWhere, id: params.id };

  const user = await getRepository(User).findOne(query);
  if (!user) {
    throw new StringError('User does not exist');
  }

  return ApiUtility.sanitizeUser(user);
};

// Update User
const update = async (params: IUpdateUser) => {
  const query = { ...baseWhere, id: params.id };

  const user = await getRepository(User).findOne(query);
  if (!user) {
    throw new StringError('User does not exist');
  }

  const updateData: Partial<User> = {
    loginID: params.loginID,
    status: params.status,
    updatedAt: new Date(),
  };

  // Hash password if provided
  if (params.password) {
    updateData.password = await PasswordUtility.hashPassword(params.password);
  }

  // If userRole is provided, convert to roleID using RoleService
  if (params.userRole) {
    const newRoleId = await RoleService.getRoleIdByName(params.userRole);
    updateData.roleID = newRoleId;
    
    // Validate studentID when changing role
    if (newRoleId !== 6 && user.studentID) {
      throw new StringError('Cannot change role from Student to another role when studentID is set');
    }
  }

  // Validate studentID changes
  if (params.studentID !== undefined) {
    const roleIdToCheck = updateData.roleID || user.roleID;
    if (params.studentID && roleIdToCheck !== 6) {
      throw new StringError('studentID can only be set for Student role users');
    }
  }

  await getRepository(User).update(query, updateData);
  return await detail({ id: params.id });
};

// List Users with pagination and filtering
const list = async (params: IUserQueryParams) => {
  let userRepo = getRepository(User).createQueryBuilder('user');
  
  // Text search
  if (params.keyword) {
    userRepo = userRepo.andWhere(
      '(LOWER(user.loginID) LIKE LOWER(:keyword) OR user.id LIKE :keyword)',
      { keyword: `%${params.keyword}%` },
    );
  }

  // Filter by status
  if (params.status) {
    userRepo = userRepo.andWhere('user.status = :status', { status: params.status });
  }

  // Filter by user role
  if (params.userRole) {
    const roleId = await RoleService.getRoleIdByName(params.userRole);
    userRepo = userRepo.andWhere('user.roleID = :roleId', { roleId });
  }

  // Sort options
  const sortBy = params.sort_by || 'id';
  const sortOrder = params.sort_order === 'asc' ? 'ASC' : 'DESC';
  userRepo = userRepo.orderBy(sortBy, sortOrder);

  // Pagination
  const total = await userRepo.getMany();
  const pagRes = ApiUtility.getPagination(total.length, params.limit, params.page);

  userRepo = userRepo
    .limit(params.limit)
    .offset(ApiUtility.getOffset(params.limit, params.page));

  const users = await userRepo.getMany();

  const response = [];
  if (users && users.length) {
    for (const item of users) {
      response.push(ApiUtility.sanitizeUser(item));
    }
  }

  return { response, pagination: pagRes.pagination };
};

// Delete User (soft delete - mark as inactive)
const remove = async (params: IDeleteById) => {
  const query = { ...baseWhere, id: params.id };

  const user = await getRepository(User).findOne(query);
  if (!user) {
    throw new StringError('User does not exist');
  }

  return await getRepository(User).update(query, {
    status: 'inactive',
    updatedAt: new Date(),
  });
};

// Permanently delete user
const permanentlyDelete = async (params: IDeleteById) => {
  const query = { id: params.id };

  const user = await getRepository(User).findOne(query);
  if (!user) {
    throw new StringError('User does not exist');
  }

  await getRepository(User).delete(query);
  return { success: true };
};

// Authenticate user
const authenticate = async (loginID: string, password: string) => {
  const user = await getRepository(User).findOne({
    where: { loginID, status: 'active' }
  });

  if (!user) {
    throw new StringError('User not found or inactive');
  }

  // Compare provided password with hashed password
  const isPasswordValid = await PasswordUtility.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new StringError('Invalid password');
  }

  return ApiUtility.sanitizeUser(user);
};

// Get user statistics
const getStatistics = async () => {
  const userRepo = getRepository(User);
  
  const [
    totalUsers,
    activeUsers,
    adminUsers,
    inactiveUsers
  ] = await Promise.all([
    userRepo.count(),
    userRepo.count({ where: { status: 'active' } }),
    userRepo.count({ where: { userRole: 'admin' } }),
    userRepo.count({ where: { status: 'inactive' } })
  ]);

  return {
    total_users: totalUsers,
    active_users: activeUsers,
    admin_users: adminUsers,
    inactive_users: inactiveUsers,
    regular_users: totalUsers - adminUsers
  };
};

export default {
  create,
  getById,
  detail,
  update,
  list,
  remove,
  permanentlyDelete,
  authenticate,
  getStatistics,
};
