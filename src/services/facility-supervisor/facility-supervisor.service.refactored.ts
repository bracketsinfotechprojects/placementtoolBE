/**
 * Facility Supervisor Service - Refactored
 * Simplified and organized for better maintainability
 */

import { getRepository } from 'typeorm';
import { FacilitySupervisor } from '../../entities/facility-supervisor/facility-supervisor.entity';
import { User } from '../../entities/user/user.entity';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import ApiUtility from '../../utilities/api.utility';
import { StringError } from '../../errors/string.error';
import {
  ICreateFacilitySupervisor,
  IUpdateFacilitySupervisor,
  IFacilitySupervisorQueryParams
} from './facility-supervisor.interfaces';

const baseWhere = { isDeleted: false };

/**
 * Main Facility Supervisor Service
 */
class FacilitySupervisorService {
  // ==================== CREATE OPERATIONS ====================
  
  async create(params: ICreateFacilitySupervisor) {
    const email = params.email || params.login?.email;
    const password = params.password || params.login?.password;

    if (!email) {
      throw new Error('email is required');
    }

    const existingSupervisor = await getRepository(FacilitySupervisor).findOne({ where: { email } });
    if (existingSupervisor) {
      throw new Error(`Facility Supervisor with email '${email}' already exists`);
    }

    const supervisor = new FacilitySupervisor();
    supervisor.first_name = params.first_name;
    supervisor.last_name = params.last_name;
    supervisor.email = params.email;
    supervisor.phone = params.phone;
    supervisor.facility_id = params.facility_id;
    supervisor.department = params.department;
    supervisor.designation = params.designation;
    supervisor.experience_years = params.experience_years;
    supervisor.status = params.status || 'active';

    const savedSupervisor = await getRepository(FacilitySupervisor).save(supervisor);
    const supervisorId = savedSupervisor.supervisor_id;

    // Create user account if password provided
    if (password) {
      const existingUser = await getRepository(User).findOne({ where: { loginID: email } });
      if (existingUser) {
        throw new Error(`User account with email '${email}' already exists`);
      }

      const supervisorRoleId = await RoleService.getRoleIdByName('FacilitySupervisor');
      const user = new User();
      user.loginID = email;
      user.password = await PasswordUtility.hashPassword(password);
      user.roleID = supervisorRoleId;
      user.supervisorID = supervisorId;
      user.studentID = null;
      user.facilityID = null;
      user.placementExecutiveID = null;
      user.trainerID = null;
      user.status = params.login?.status || 'active';

      await getRepository(User).save(user);
      console.log(`✅ Created facility supervisor user account`);
    }

    return await getRepository(FacilitySupervisor).findOne({
      where: { supervisor_id: supervisorId }
    });
  }

  // ==================== READ OPERATIONS ====================
  
  async getById(id: number) {
    const supervisor = await getRepository(FacilitySupervisor).findOne({
      where: { supervisor_id: id, ...baseWhere }
    });
    return supervisor ? ApiUtility.sanitizeData(supervisor) : null;
  }

  async list(params: IFacilitySupervisorQueryParams) {
    let query = getRepository(FacilitySupervisor)
      .createQueryBuilder('supervisor')
      .where('supervisor.isDeleted = :isDeleted', { isDeleted: false });

    if (params.keyword) {
      query = query.andWhere(
        '(LOWER(supervisor.first_name) LIKE LOWER(:keyword) OR LOWER(supervisor.last_name) LIKE LOWER(:keyword) OR LOWER(supervisor.email) LIKE LOWER(:keyword))',
        { keyword: `%${params.keyword}%` }
      );
    }

    if (params.status) {
      query = query.andWhere('supervisor.status = :status', { status: params.status });
    }

    if (params.facility_id) {
      query = query.andWhere('supervisor.facility_id = :facilityId', { facilityId: params.facility_id });
    }

    if (params.department) {
      query = query.andWhere('supervisor.department = :department', { department: params.department });
    }

    if (params.designation) {
      query = query.andWhere('supervisor.designation = :designation', { designation: params.designation });
    }

    if (params.min_experience) {
      query = query.andWhere('supervisor.experience_years >= :minExp', { minExp: params.min_experience });
    }

    if (params.max_experience) {
      query = query.andWhere('supervisor.experience_years <= :maxExp', { maxExp: params.max_experience });
    }

    const sortBy = params.sort_by || 'supervisor_id';
    const sortOrder = params.sort_order === 'asc' ? 'ASC' : 'DESC';
    query = query.orderBy(sortBy, sortOrder);

    const total = await query.getCount();
    const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

    query = query
      .limit(params.limit || 10)
      .offset(ApiUtility.getOffset(params.limit, params.page));

    const supervisors = await query.getMany();

    return {
      response: supervisors.map(s => ApiUtility.sanitizeData(s)),
      pagination: pagRes.pagination
    };
  }

  // ==================== UPDATE OPERATIONS ====================
  
  async update(params: IUpdateFacilitySupervisor) {
    const supervisor = await getRepository(FacilitySupervisor).findOne({
      where: { supervisor_id: params.supervisor_id, ...baseWhere }
    });

    if (!supervisor) {
      throw new StringError('Facility Supervisor does not exist');
    }

    const updateData: Partial<FacilitySupervisor> = { updatedAt: new Date() };
    
    if (params.first_name !== undefined) updateData.first_name = params.first_name;
    if (params.last_name !== undefined) updateData.last_name = params.last_name;
    if (params.email !== undefined) updateData.email = params.email;
    if (params.phone !== undefined) updateData.phone = params.phone;
    if (params.facility_id !== undefined) updateData.facility_id = params.facility_id;
    if (params.department !== undefined) updateData.department = params.department;
    if (params.designation !== undefined) updateData.designation = params.designation;
    if (params.experience_years !== undefined) updateData.experience_years = params.experience_years;
    if (params.status !== undefined) updateData.status = params.status;

    await getRepository(FacilitySupervisor).update(
      { supervisor_id: params.supervisor_id },
      updateData
    );

    return await getRepository(FacilitySupervisor).findOne({
      where: { supervisor_id: params.supervisor_id }
    });
  }

  async remove(id: number) {
    const supervisor = await getRepository(FacilitySupervisor).findOne({
      where: { supervisor_id: id, ...baseWhere }
    });

    if (!supervisor) {
      throw new StringError('Facility Supervisor does not exist');
    }

    return await getRepository(FacilitySupervisor).update(
      { supervisor_id: id },
      { isDeleted: true, updatedAt: new Date() }
    );
  }

  async permanentlyDelete(id: number) {
    const supervisor = await getRepository(FacilitySupervisor).findOne({
      where: { supervisor_id: id }
    });

    if (!supervisor) {
      throw new StringError('Facility Supervisor does not exist');
    }

    await getRepository(FacilitySupervisor).delete({ supervisor_id: id });
    return { success: true };
  }
}

export default new FacilitySupervisorService();

// Re-export interfaces
export * from './facility-supervisor.interfaces';
