import { getRepository, getConnection } from 'typeorm';
import { PlacementExecutive } from '../../entities/placement-executive/placement-executive.entity';
import { User } from '../../entities/user/user.entity';
import PlacementExecutiveRepository, { IPlacementExecutiveQueryParams } from '../../repositories/placement-executive.repository';
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreatePlacementExecutive) => {
  if (!params.full_name) {
    throw new Error('full_name is required');
  }
  if (!params.mobile_number) {
    throw new Error('mobile_number is required');
  }
  if (!params.joining_date) {
    throw new Error('joining_date is required');
  }
  if (!params.employment_type) {
    throw new Error('employment_type is required');
  }

  // Validate login credentials
  if (!params.login || !params.login.userID || !params.login.password) {
    throw new Error('login object with userID and password is required');
  }

  // Use transaction to ensure all-or-nothing behavior
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Check if email already exists (if provided)
    if (params.email) {
      const existingExecutive = await PlacementExecutiveRepository.findByEmail(params.email);
      if (existingExecutive) {
        throw new Error(`Email '${params.email}' already exists`);
      }
    }

    // Check if loginID already exists
    const existingUser = await queryRunner.manager.findOne(User, {
      where: { loginID: params.login.userID }
    });

    if (existingUser) {
      throw new Error(`Login ID '${params.login.userID}' already exists`);
    }

    // Get Placement Executive role ID
    const placementExecutiveRoleId = await RoleService.getRoleIdByName('Placement Executive');

    // Create placement executive first
    const executive = new PlacementExecutive();
    executive.full_name = params.full_name;
    executive.mobile_number = params.mobile_number;
    executive.email = params.email;
    executive.photograph = params.photograph;
    executive.joining_date = new Date(params.joining_date);
    executive.employment_type = params.employment_type;
    executive.facility_types_handled = params.facility_types_handled || [];
    executive.user_id = null; // Will be updated after user creation

    const savedExecutive = await queryRunner.manager.save(executive);

    // Create user account with placementExecutiveID
    const user = new User();
    user.loginID = params.login.userID;
    user.password = await PasswordUtility.hashPassword(params.login.password);
    user.roleID = placementExecutiveRoleId;
    user.studentID = null;
    user.facilityID = null;
    user.supervisorID = null;
    user.placementExecutiveID = savedExecutive.executive_id; // Auto-filled
    user.trainerID = null;
    user.status = 'active';

    const savedUser = await queryRunner.manager.save(user);

    // Update placement executive with user_id
    await queryRunner.manager.update(PlacementExecutive, { executive_id: savedExecutive.executive_id }, {
      user_id: savedUser.id
    });

    await queryRunner.commitTransaction();

    console.log(`✅ Created placement executive with user account (userID=${savedUser.id}, executiveID=${savedExecutive.executive_id})`);

    return await PlacementExecutiveRepository.findById(savedExecutive.executive_id);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Transaction failed, rolling back all changes:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const getById = async (id: number) => {
  const executive = await PlacementExecutiveRepository.findById(id);
  if (!executive) {
    throw new StringError('Placement Executive does not exist');
  }
  return executive;
};

const update = async (params: IUpdatePlacementExecutive) => {
  const executive = await PlacementExecutiveRepository.findById(params.id);
  if (!executive) {
    throw new StringError('Placement Executive does not exist');
  }

  // Check email uniqueness if being updated
  if (params.email && params.email !== executive.email) {
    const existingExecutive = await PlacementExecutiveRepository.findByEmail(params.email);
    if (existingExecutive) {
      throw new Error(`Email '${params.email}' already exists`);
    }
  }

  const updateData: Partial<PlacementExecutive> = {
    updatedAt: new Date()
  };

  if (params.full_name !== undefined) updateData.full_name = params.full_name;
  if (params.mobile_number !== undefined) updateData.mobile_number = params.mobile_number;
  if (params.email !== undefined) updateData.email = params.email;
  if (params.photograph !== undefined) updateData.photograph = params.photograph;
  if (params.joining_date !== undefined) updateData.joining_date = new Date(params.joining_date);
  if (params.employment_type !== undefined) updateData.employment_type = params.employment_type;
  if (params.facility_types_handled !== undefined) updateData.facility_types_handled = params.facility_types_handled;

  await getRepository(PlacementExecutive).update({ executive_id: params.id }, updateData);
  return await getById(params.id);
};

const list = async (params: IPlacementExecutiveQueryParams) => {
  const { executives, total } = await PlacementExecutiveRepository.findWithFilters(params);
  const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

  return { response: executives, pagination: pagRes.pagination };
};

const remove = async (id: number) => {
  const executive = await PlacementExecutiveRepository.findById(id);
  if (!executive) {
    throw new StringError('Placement Executive does not exist');
  }

  await PlacementExecutiveRepository.softDelete(id);
  return { success: true };
};

const permanentlyDelete = async (id: number) => {
  const executive = await PlacementExecutiveRepository.findById(id);
  if (!executive) {
    throw new StringError('Placement Executive does not exist');
  }

  await PlacementExecutiveRepository.permanentlyDelete(id);
  return { success: true };
};

export interface ICreatePlacementExecutive {
  full_name: string;
  mobile_number: string;
  email?: string;
  photograph?: string;
  joining_date: string | Date;
  employment_type: 'full-time' | 'part-time' | 'contract';
  facility_types_handled?: string[];
  login: {
    userID: string;
    password: string;
  };
}

export interface IUpdatePlacementExecutive {
  id: number;
  full_name?: string;
  mobile_number?: string;
  email?: string;
  photograph?: string;
  joining_date?: string | Date;
  employment_type?: 'full-time' | 'part-time' | 'contract';
  facility_types_handled?: string[];
}

export default {
  create,
  getById,
  update,
  list,
  remove,
  permanentlyDelete
};
