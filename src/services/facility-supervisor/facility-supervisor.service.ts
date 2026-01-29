import { getRepository, getConnection } from 'typeorm';
import { FacilitySupervisor } from '../../entities/facility-supervisor/facility-supervisor.entity';
import { User } from '../../entities/user/user.entity';
import FacilitySupervisorRepository, { IFacilitySupervisorQueryParams } from '../../repositories/facility-supervisor.repository';
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreateFacilitySupervisor) => {
  if (!params.full_name) {
    throw new Error('full_name is required');
  }
  if (!params.designation) {
    throw new Error('designation is required');
  }
  if (!params.mobile_number) {
    throw new Error('mobile_number is required');
  }
  if (!params.facility_id) {
    throw new Error('facility_id is required');
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
      const existingSupervisor = await FacilitySupervisorRepository.findByEmail(params.email);
      if (existingSupervisor) {
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

    // Get Supervisor role ID
    const supervisorRoleId = await RoleService.getRoleIdByName('Supervisor');

    // Create facility supervisor first
    const supervisor = new FacilitySupervisor();
    supervisor.full_name = params.full_name;
    supervisor.designation = params.designation;
    supervisor.mobile_number = params.mobile_number;
    supervisor.email = params.email;
    supervisor.photograph = params.photograph;
    supervisor.facility_id = params.facility_id;
    supervisor.facility_name = params.facility_name;
    supervisor.branch_site = params.branch_site;
    supervisor.facility_types = params.facility_types || [];
    supervisor.facility_address = params.facility_address;
    supervisor.max_students_can_handle = params.max_students_can_handle;
    supervisor.id_proof_document = params.id_proof_document;
    supervisor.police_check_document = params.police_check_document;
    supervisor.authorization_letter_document = params.authorization_letter_document;
    supervisor.portal_access_enabled = params.portal_access_enabled || false;
    supervisor.user_id = null; // Will be updated after user creation

    const savedSupervisor = await queryRunner.manager.save(supervisor);

    // Create user account with supervisorID auto-filled
    const user = new User();
    user.loginID = params.login.userID;
    user.password = await PasswordUtility.hashPassword(params.login.password);
    user.roleID = supervisorRoleId;
    user.studentID = null;
    user.facilityID = null;
    user.supervisorID = savedSupervisor.supervisor_id; // Auto-filled
    user.placementExecutiveID = null;
    user.trainerID = null;
    user.status = 'active';

    const savedUser = await queryRunner.manager.save(user);

    // Update facility supervisor with user_id
    await queryRunner.manager.update(FacilitySupervisor, { supervisor_id: savedSupervisor.supervisor_id }, {
      user_id: savedUser.id
    });

    await queryRunner.commitTransaction();

    console.log(`✅ Created facility supervisor with user account (userID=${savedUser.id}, supervisorID=${savedSupervisor.supervisor_id})`);

    return await FacilitySupervisorRepository.findById(savedSupervisor.supervisor_id);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Transaction failed, rolling back all changes:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const getById = async (id: number) => {
  const supervisor = await FacilitySupervisorRepository.findById(id);
  if (!supervisor) {
    throw new StringError('Facility Supervisor does not exist');
  }
  return supervisor;
};

const update = async (params: IUpdateFacilitySupervisor) => {
  const supervisor = await FacilitySupervisorRepository.findById(params.id);
  if (!supervisor) {
    throw new StringError('Facility Supervisor does not exist');
  }

  // Check email uniqueness if being updated
  if (params.email && params.email !== supervisor.email) {
    const existingSupervisor = await FacilitySupervisorRepository.findByEmail(params.email);
    if (existingSupervisor) {
      throw new Error(`Email '${params.email}' already exists`);
    }
  }

  const updateData: Partial<FacilitySupervisor> = {
    updatedAt: new Date()
  };

  if (params.full_name !== undefined) updateData.full_name = params.full_name;
  if (params.designation !== undefined) updateData.designation = params.designation;
  if (params.mobile_number !== undefined) updateData.mobile_number = params.mobile_number;
  if (params.email !== undefined) updateData.email = params.email;
  if (params.photograph !== undefined) updateData.photograph = params.photograph;
  if (params.facility_id !== undefined) updateData.facility_id = params.facility_id;
  if (params.facility_name !== undefined) updateData.facility_name = params.facility_name;
  if (params.branch_site !== undefined) updateData.branch_site = params.branch_site;
  if (params.facility_types !== undefined) updateData.facility_types = params.facility_types;
  if (params.facility_address !== undefined) updateData.facility_address = params.facility_address;
  if (params.max_students_can_handle !== undefined) updateData.max_students_can_handle = params.max_students_can_handle;
  if (params.id_proof_document !== undefined) updateData.id_proof_document = params.id_proof_document;
  if (params.police_check_document !== undefined) updateData.police_check_document = params.police_check_document;
  if (params.authorization_letter_document !== undefined) updateData.authorization_letter_document = params.authorization_letter_document;
  if (params.portal_access_enabled !== undefined) updateData.portal_access_enabled = params.portal_access_enabled;

  await getRepository(FacilitySupervisor).update({ supervisor_id: params.id }, updateData);
  return await getById(params.id);
};

const list = async (params: IFacilitySupervisorQueryParams) => {
  const { supervisors, total } = await FacilitySupervisorRepository.findWithFilters(params);
  const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

  return { response: supervisors, pagination: pagRes.pagination };
};

const remove = async (id: number) => {
  const supervisor = await FacilitySupervisorRepository.findById(id);
  if (!supervisor) {
    throw new StringError('Facility Supervisor does not exist');
  }

  await FacilitySupervisorRepository.softDelete(id);
  return { success: true };
};

const permanentlyDelete = async (id: number) => {
  const supervisor = await FacilitySupervisorRepository.findById(id);
  if (!supervisor) {
    throw new StringError('Facility Supervisor does not exist');
  }

  await FacilitySupervisorRepository.permanentlyDelete(id);
  return { success: true };
};

export interface ICreateFacilitySupervisor {
  full_name: string;
  designation: string;
  mobile_number: string;
  email?: string;
  photograph?: string;
  facility_id: number;
  facility_name?: string;
  branch_site?: string;
  facility_types?: string[];
  facility_address?: string;
  max_students_can_handle?: number;
  id_proof_document?: string;
  police_check_document?: string;
  authorization_letter_document?: string;
  portal_access_enabled?: boolean;
  login: {
    userID: string;
    password: string;
  };
}

export interface IUpdateFacilitySupervisor {
  id: number;
  full_name?: string;
  designation?: string;
  mobile_number?: string;
  email?: string;
  photograph?: string;
  facility_id?: number;
  facility_name?: string;
  branch_site?: string;
  facility_types?: string[];
  facility_address?: string;
  max_students_can_handle?: number;
  id_proof_document?: string;
  police_check_document?: string;
  authorization_letter_document?: string;
  portal_access_enabled?: boolean;
}

export default {
  create,
  getById,
  update,
  list,
  remove,
  permanentlyDelete
};
