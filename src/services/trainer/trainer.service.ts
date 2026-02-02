import { getRepository, getConnection } from 'typeorm';
import { Trainer } from '../../entities/trainer/trainer.entity';
import { User } from '../../entities/user/user.entity';
import TrainerRepository, { ITrainerQueryParams } from '../../repositories/trainer.repository';
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreateTrainer) => {
  // Validate required fields
  if (!params.first_name) {
    throw new Error('first_name is required');
  }
  if (!params.last_name) {
    throw new Error('last_name is required');
  }
  if (!params.gender) {
    throw new Error('gender is required');
  }
  if (!params.date_of_birth) {
    throw new Error('date_of_birth is required');
  }
  if (!params.mobile_number) {
    throw new Error('mobile_number is required');
  }
  if (!params.email) {
    throw new Error('email is required');
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
    // Check if email already exists
    const existingTrainer = await TrainerRepository.findByEmail(params.email);
    if (existingTrainer) {
      throw new Error(`Email '${params.email}' already exists`);
    }

    // Check if loginID already exists
    const existingUser = await queryRunner.manager.findOne(User, {
      where: { loginID: params.login.userID }
    });

    if (existingUser) {
      throw new Error(`Login ID '${params.login.userID}' already exists`);
    }

    // Get Trainer role ID
    const trainerRoleId = await RoleService.getRoleIdByName('Trainer');

    // Create trainer first
    const trainer = new Trainer();
    trainer.first_name = params.first_name;
    trainer.last_name = params.last_name;
    trainer.gender = params.gender;
    trainer.date_of_birth = new Date(params.date_of_birth);
    trainer.mobile_number = params.mobile_number;
    trainer.alternate_contact = params.alternate_contact;
    trainer.email = params.email;
    trainer.trainer_type = params.trainer_type;
    trainer.course_auth = params.course_auth;
    trainer.acc_numbers = params.acc_numbers;
    trainer.yoe = params.yoe;
    trainer.state_covered = params.state_covered || [];
    trainer.cities_covered = params.cities_covered || [];
    trainer.available_days = params.available_days || [];
    trainer.time_slots = params.time_slots || [];
    trainer.suprise_visit = params.suprise_visit || false;
    trainer.photograph = params.photograph;
    trainer.user_id = null; // Will be updated after user creation

    const savedTrainer = await queryRunner.manager.save(trainer);

    // Create user account with trainerID auto-filled
    const user = new User();
    user.loginID = params.login.userID;
    user.password = await PasswordUtility.hashPassword(params.login.password);
    user.roleID = trainerRoleId;
    user.studentID = null;
    user.facilityID = null;
    user.supervisorID = null;
    user.placementExecutiveID = null;
    user.trainerID = savedTrainer.trainer_id; // Auto-filled
    user.status = 'active';

    const savedUser = await queryRunner.manager.save(user);

    // Update trainer with user_id
    await queryRunner.manager.update(Trainer, { trainer_id: savedTrainer.trainer_id }, {
      user_id: savedUser.id
    });

    await queryRunner.commitTransaction();

    console.log(`✅ Created trainer with user account (userID=${savedUser.id}, trainerID=${savedTrainer.trainer_id})`);

    return await TrainerRepository.findById(savedTrainer.trainer_id);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Transaction failed, rolling back all changes:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const getById = async (id: number) => {
  const trainer = await TrainerRepository.findById(id);
  if (!trainer) {
    throw new StringError('Trainer does not exist');
  }
  return trainer;
};

const update = async (params: IUpdateTrainer) => {
  const trainer = await TrainerRepository.findById(params.id);
  if (!trainer) {
    throw new StringError('Trainer does not exist');
  }

  // Check email uniqueness if being updated
  if (params.email && params.email !== trainer.email) {
    const existingTrainer = await TrainerRepository.findByEmail(params.email);
    if (existingTrainer) {
      throw new Error(`Email '${params.email}' already exists`);
    }
  }

  const updateData: Partial<Trainer> = {
    updatedAt: new Date()
  };

  if (params.first_name !== undefined) updateData.first_name = params.first_name;
  if (params.last_name !== undefined) updateData.last_name = params.last_name;
  if (params.gender !== undefined) updateData.gender = params.gender;
  if (params.date_of_birth !== undefined) updateData.date_of_birth = new Date(params.date_of_birth);
  if (params.mobile_number !== undefined) updateData.mobile_number = params.mobile_number;
  if (params.alternate_contact !== undefined) updateData.alternate_contact = params.alternate_contact;
  if (params.email !== undefined) updateData.email = params.email;
  if (params.trainer_type !== undefined) updateData.trainer_type = params.trainer_type;
  if (params.course_auth !== undefined) updateData.course_auth = params.course_auth;
  if (params.acc_numbers !== undefined) updateData.acc_numbers = params.acc_numbers;
  if (params.yoe !== undefined) updateData.yoe = params.yoe;
  if (params.state_covered !== undefined) updateData.state_covered = params.state_covered;
  if (params.cities_covered !== undefined) updateData.cities_covered = params.cities_covered;
  if (params.available_days !== undefined) updateData.available_days = params.available_days;
  if (params.time_slots !== undefined) updateData.time_slots = params.time_slots;
  if (params.suprise_visit !== undefined) updateData.suprise_visit = params.suprise_visit;
  if (params.photograph !== undefined) updateData.photograph = params.photograph;

  await getRepository(Trainer).update({ trainer_id: params.id }, updateData);
  return await getById(params.id);
};

const list = async (params: ITrainerQueryParams) => {
  const { trainers, total } = await TrainerRepository.findWithFilters(params);
  const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

  return { response: trainers, pagination: pagRes.pagination };
};

const remove = async (id: number) => {
  const trainer = await TrainerRepository.findById(id);
  if (!trainer) {
    throw new StringError('Trainer does not exist');
  }

  await TrainerRepository.softDelete(id);
  return { success: true };
};

const permanentlyDelete = async (id: number) => {
  const trainer = await TrainerRepository.findById(id);
  if (!trainer) {
    throw new StringError('Trainer does not exist');
  }

  await TrainerRepository.permanentlyDelete(id);
  return { success: true };
};

export interface ICreateTrainer {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  mobile_number: string;
  alternate_contact?: string;
  email: string;
  trainer_type?: string;
  course_auth?: string;
  acc_numbers?: string;
  yoe?: number;
  state_covered?: string[];
  cities_covered?: string[];
  available_days?: string[];
  time_slots?: string[];
  suprise_visit?: boolean;
  photograph?: string;
  login: {
    userID: string;
    password: string;
  };
}

export interface IUpdateTrainer {
  id: number;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  mobile_number?: string;
  alternate_contact?: string;
  email?: string;
  trainer_type?: string;
  course_auth?: string;
  acc_numbers?: string;
  yoe?: number;
  state_covered?: string[];
  cities_covered?: string[];
  available_days?: string[];
  time_slots?: string[];
  suprise_visit?: boolean;
  photograph?: string;
}

export default {
  create,
  getById,
  update,
  list,
  remove,
  permanentlyDelete
};
