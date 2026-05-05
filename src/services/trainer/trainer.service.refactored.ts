/**
 * Trainer Service - Main Entry Point
 * Consolidated service that delegates to specialized sub-services
 * 
 * This refactored version splits the original 1000+ line service into:
 * - trainer-file.service.ts: File upload operations
 * - trainer.interfaces.ts: Type definitions
 * 
 * Note: Full refactoring would include:
 * - trainer-creation.service.ts: Create operations
 * - trainer-query.service.ts: Read operations
 * - trainer-update.service.ts: Update/Delete operations
 * - trainer-bulk.service.ts: Bulk upload operations
 */

import { getRepository } from 'typeorm';
import { Trainer } from '../../entities/trainer/trainer.entity';
import { User } from '../../entities/user/user.entity';
import TrainerFileService from './trainer-file.service';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import ApiUtility from '../../utilities/api.utility';
import { StringError } from '../../errors/string.error';
import { ICreateTrainer, IUpdateTrainer, ITrainerQueryParams } from './trainer.interfaces';

/**
 * Main Trainer Service
 * Delegates file operations to specialized service
 */
class TrainerService {
  // ==================== FILE OPERATIONS ====================
  
  uploadPhotograph = TrainerFileService.uploadPhotograph.bind(TrainerFileService);
  uploadWWCDocument = TrainerFileService.uploadWWCDocument.bind(TrainerFileService);
  uploadPoliceCheckDocument = TrainerFileService.uploadPoliceCheckDocument.bind(TrainerFileService);
  cleanupPhotograph = TrainerFileService.cleanupPhotograph.bind(TrainerFileService);
  cleanupDocument = TrainerFileService.cleanupDocument.bind(TrainerFileService);

  // ==================== CREATE OPERATIONS ====================
  
  async create(
    params: ICreateTrainer,
    photographFile?: Express.Multer.File,
    wwcDocumentFile?: Express.Multer.File,
    policeCheckDocumentFile?: Express.Multer.File
  ) {
    const email = params.email || params.login?.email;
    const password = params.password || params.login?.password;

    if (!email) {
      throw new Error('email is required');
    }

    const existingTrainer = await getRepository(Trainer).findOne({ where: { email } });
    if (existingTrainer) {
      throw new Error(`Trainer with email '${email}' already exists`);
    }

    const trainer = new Trainer();
    Object.assign(trainer, params);

    const savedTrainer = await getRepository(Trainer).save(trainer);
    const trainerId = savedTrainer.trainer_id;

    // Upload files if provided
    if (photographFile) {
      const photographPath = await this.uploadPhotograph(photographFile, trainerId);
      await getRepository(Trainer).update({ trainer_id: trainerId }, { photograph_path: photographPath });
    }

    if (wwcDocumentFile) {
      const wwcPath = await this.uploadWWCDocument(wwcDocumentFile, trainerId);
      await getRepository(Trainer).update({ trainer_id: trainerId }, { wwc_document_path: wwcPath });
    }

    if (policeCheckDocumentFile) {
      const policePath = await this.uploadPoliceCheckDocument(policeCheckDocumentFile, trainerId);
      await getRepository(Trainer).update({ trainer_id: trainerId }, { police_check_document_path: policePath });
    }

    // Create user account if password provided
    if (password) {
      const trainerRoleId = await RoleService.getRoleIdByName('Trainer');
      const user = new User();
      user.loginID = email;
      user.password = await PasswordUtility.hashPassword(password);
      user.roleID = trainerRoleId;
      user.trainerID = trainerId;
      user.status = params.login?.status || 'active';
      await getRepository(User).save(user);
    }

    return await getRepository(Trainer).findOne({ where: { trainer_id: trainerId } });
  }

  // ==================== READ OPERATIONS ====================
  
  async getById(id: number) {
    const trainer = await getRepository(Trainer).findOne({ where: { trainer_id: id, isDeleted: false } });
    return trainer ? ApiUtility.sanitizeData(trainer) : null;
  }

  async list(params: ITrainerQueryParams) {
    let query = getRepository(Trainer).createQueryBuilder('trainer')
      .where('trainer.isDeleted = :isDeleted', { isDeleted: false });

    if (params.keyword) {
      query = query.andWhere(
        '(LOWER(trainer.first_name) LIKE LOWER(:keyword) OR LOWER(trainer.last_name) LIKE LOWER(:keyword) OR LOWER(trainer.email) LIKE LOWER(:keyword))',
        { keyword: `%${params.keyword}%` }
      );
    }

    if (params.status) {
      query = query.andWhere('trainer.status = :status', { status: params.status });
    }

    if (params.specialization) {
      query = query.andWhere('trainer.specialization = :specialization', { specialization: params.specialization });
    }

    const sortBy = params.sort_by || 'trainer_id';
    const sortOrder = params.sort_order === 'asc' ? 'ASC' : 'DESC';
    query = query.orderBy(sortBy, sortOrder);

    const total = await query.getCount();
    const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

    query = query
      .limit(params.limit || 10)
      .offset(ApiUtility.getOffset(params.limit, params.page));

    const trainers = await query.getMany();

    return {
      response: trainers.map(t => ApiUtility.sanitizeData(t)),
      pagination: pagRes.pagination
    };
  }

  // ==================== UPDATE OPERATIONS ====================
  
  async update(
    params: IUpdateTrainer,
    photographFile?: Express.Multer.File,
    wwcDocumentFile?: Express.Multer.File,
    policeCheckDocumentFile?: Express.Multer.File
  ) {
    const trainer = await getRepository(Trainer).findOne({ 
      where: { trainer_id: params.trainer_id, isDeleted: false } 
    });

    if (!trainer) {
      throw new StringError('Trainer does not exist');
    }

    const updateData: Partial<Trainer> = { updatedAt: new Date() };
    Object.keys(params).forEach(key => {
      if (key !== 'trainer_id' && params[key] !== undefined) {
        updateData[key] = params[key];
      }
    });

    // Handle file uploads
    if (photographFile) {
      if (trainer.photograph_path) {
        this.cleanupPhotograph(trainer.photograph_path);
      }
      updateData.photograph_path = await this.uploadPhotograph(photographFile, params.trainer_id);
    }

    if (wwcDocumentFile) {
      if (trainer.wwc_document_path) {
        this.cleanupDocument(trainer.wwc_document_path);
      }
      updateData.wwc_document_path = await this.uploadWWCDocument(wwcDocumentFile, params.trainer_id);
    }

    if (policeCheckDocumentFile) {
      if (trainer.police_check_document_path) {
        this.cleanupDocument(trainer.police_check_document_path);
      }
      updateData.police_check_document_path = await this.uploadPoliceCheckDocument(policeCheckDocumentFile, params.trainer_id);
    }

    await getRepository(Trainer).update({ trainer_id: params.trainer_id }, updateData);

    return await getRepository(Trainer).findOne({ where: { trainer_id: params.trainer_id } });
  }

  async remove(id: number) {
    const trainer = await getRepository(Trainer).findOne({ where: { trainer_id: id, isDeleted: false } });
    if (!trainer) {
      throw new StringError('Trainer does not exist');
    }

    return await getRepository(Trainer).update(
      { trainer_id: id },
      { isDeleted: true, updatedAt: new Date() }
    );
  }

  async permanentlyDelete(id: number) {
    const trainer = await getRepository(Trainer).findOne({ where: { trainer_id: id } });
    if (!trainer) {
      throw new StringError('Trainer does not exist');
    }

    // Cleanup files
    if (trainer.photograph_path) {
      this.cleanupPhotograph(trainer.photograph_path);
    }
    if (trainer.wwc_document_path) {
      this.cleanupDocument(trainer.wwc_document_path);
    }
    if (trainer.police_check_document_path) {
      this.cleanupDocument(trainer.police_check_document_path);
    }

    await getRepository(Trainer).delete({ trainer_id: id });
    return { success: true };
  }
}

export default new TrainerService();

// Re-export interfaces for convenience
export * from './trainer.interfaces';
