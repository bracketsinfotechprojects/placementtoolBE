/**
 * Placement Executive Service - Main Entry Point
 * Refactored for better organization and maintainability
 */

import { getRepository } from 'typeorm';
import { PlacementExecutive } from '../../entities/placement-executive/placement-executive.entity';
import { User } from '../../entities/user/user.entity';
import PlacementExecutiveFileService from './placement-executive-file.service';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import ApiUtility from '../../utilities/api.utility';
import { StringError } from '../../errors/string.error';
import {
  ICreatePlacementExecutive,
  IUpdatePlacementExecutive,
  IPlacementExecutiveQueryParams
} from './placement-executive.interfaces';

const baseWhere = { isDeleted: false };

/**
 * Main Placement Executive Service
 */
class PlacementExecutiveService {
  // ==================== FILE OPERATIONS ====================
  
  uploadPhotograph = PlacementExecutiveFileService.uploadPhotograph.bind(PlacementExecutiveFileService);
  cleanupPhotograph = PlacementExecutiveFileService.cleanupPhotograph.bind(PlacementExecutiveFileService);

  // ==================== CREATE OPERATIONS ====================
  
  async create(params: ICreatePlacementExecutive, photographFile?: Express.Multer.File) {
    const email = params.email || params.login?.email;
    const password = params.password || params.login?.password;

    if (!email) {
      throw new Error('email is required');
    }

    const existingExecutive = await getRepository(PlacementExecutive).findOne({ where: { email } });
    if (existingExecutive) {
      throw new Error(`Placement Executive with email '${email}' already exists`);
    }

    const executive = new PlacementExecutive();
    executive.first_name = params.first_name;
    executive.last_name = params.last_name;
    executive.email = params.email;
    executive.phone = params.phone;
    executive.department = params.department;
    executive.designation = params.designation;
    executive.experience_years = params.experience_years;
    executive.status = params.status || 'active';

    const savedExecutive = await getRepository(PlacementExecutive).save(executive);
    const executiveId = savedExecutive.placement_executive_id;

    // Upload photograph if provided
    if (photographFile) {
      const photographPath = await this.uploadPhotograph(photographFile, executiveId);
      await getRepository(PlacementExecutive).update(
        { placement_executive_id: executiveId },
        { photograph_path: photographPath }
      );
    }

    // Create user account if password provided
    if (password) {
      const existingUser = await getRepository(User).findOne({ where: { loginID: email } });
      if (existingUser) {
        throw new Error(`User account with email '${email}' already exists`);
      }

      const executiveRoleId = await RoleService.getRoleIdByName('PlacementExecutive');
      const user = new User();
      user.loginID = email;
      user.password = await PasswordUtility.hashPassword(password);
      user.roleID = executiveRoleId;
      user.placementExecutiveID = executiveId;
      user.studentID = null;
      user.facilityID = null;
      user.supervisorID = null;
      user.trainerID = null;
      user.status = params.login?.status || 'active';

      await getRepository(User).save(user);
      console.log(`✅ Created placement executive user account`);
    }

    return await getRepository(PlacementExecutive).findOne({
      where: { placement_executive_id: executiveId }
    });
  }

  // ==================== READ OPERATIONS ====================
  
  async getById(id: number) {
    const executive = await getRepository(PlacementExecutive).findOne({
      where: { placement_executive_id: id, ...baseWhere }
    });
    return executive ? ApiUtility.sanitizeData(executive) : null;
  }

  async list(params: IPlacementExecutiveQueryParams) {
    let query = getRepository(PlacementExecutive)
      .createQueryBuilder('executive')
      .where('executive.isDeleted = :isDeleted', { isDeleted: false });

    if (params.keyword) {
      query = query.andWhere(
        '(LOWER(executive.first_name) LIKE LOWER(:keyword) OR LOWER(executive.last_name) LIKE LOWER(:keyword) OR LOWER(executive.email) LIKE LOWER(:keyword))',
        { keyword: `%${params.keyword}%` }
      );
    }

    if (params.status) {
      query = query.andWhere('executive.status = :status', { status: params.status });
    }

    if (params.department) {
      query = query.andWhere('executive.department = :department', { department: params.department });
    }

    if (params.designation) {
      query = query.andWhere('executive.designation = :designation', { designation: params.designation });
    }

    if (params.min_experience) {
      query = query.andWhere('executive.experience_years >= :minExp', { minExp: params.min_experience });
    }

    if (params.max_experience) {
      query = query.andWhere('executive.experience_years <= :maxExp', { maxExp: params.max_experience });
    }

    const sortBy = params.sort_by || 'placement_executive_id';
    const sortOrder = params.sort_order === 'asc' ? 'ASC' : 'DESC';
    query = query.orderBy(sortBy, sortOrder);

    const total = await query.getCount();
    const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

    query = query
      .limit(params.limit || 10)
      .offset(ApiUtility.getOffset(params.limit, params.page));

    const executives = await query.getMany();

    return {
      response: executives.map(e => ApiUtility.sanitizeData(e)),
      pagination: pagRes.pagination
    };
  }

  // ==================== UPDATE OPERATIONS ====================
  
  async update(params: IUpdatePlacementExecutive) {
    const executive = await getRepository(PlacementExecutive).findOne({
      where: { placement_executive_id: params.placement_executive_id, ...baseWhere }
    });

    if (!executive) {
      throw new StringError('Placement Executive does not exist');
    }

    const updateData: Partial<PlacementExecutive> = { updatedAt: new Date() };
    
    if (params.first_name !== undefined) updateData.first_name = params.first_name;
    if (params.last_name !== undefined) updateData.last_name = params.last_name;
    if (params.email !== undefined) updateData.email = params.email;
    if (params.phone !== undefined) updateData.phone = params.phone;
    if (params.department !== undefined) updateData.department = params.department;
    if (params.designation !== undefined) updateData.designation = params.designation;
    if (params.experience_years !== undefined) updateData.experience_years = params.experience_years;
    if (params.status !== undefined) updateData.status = params.status;
    if (params.photograph_path !== undefined) updateData.photograph_path = params.photograph_path;

    await getRepository(PlacementExecutive).update(
      { placement_executive_id: params.placement_executive_id },
      updateData
    );

    return await getRepository(PlacementExecutive).findOne({
      where: { placement_executive_id: params.placement_executive_id }
    });
  }

  async remove(id: number) {
    const executive = await getRepository(PlacementExecutive).findOne({
      where: { placement_executive_id: id, ...baseWhere }
    });

    if (!executive) {
      throw new StringError('Placement Executive does not exist');
    }

    return await getRepository(PlacementExecutive).update(
      { placement_executive_id: id },
      { isDeleted: true, updatedAt: new Date() }
    );
  }

  async permanentlyDelete(id: number) {
    const executive = await getRepository(PlacementExecutive).findOne({
      where: { placement_executive_id: id }
    });

    if (!executive) {
      throw new StringError('Placement Executive does not exist');
    }

    // Cleanup photograph
    if (executive.photograph_path) {
      this.cleanupPhotograph(executive.photograph_path);
    }

    await getRepository(PlacementExecutive).delete({ placement_executive_id: id });
    return { success: true };
  }
}

export default new PlacementExecutiveService();

// Re-export interfaces
export * from './placement-executive.interfaces';
