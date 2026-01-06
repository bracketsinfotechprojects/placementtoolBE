import { QueryRunner } from 'typeorm';
import { User } from '../entities/user/user.entity';
import Encryption from '../utilities/encryption.utility';
import logger from '../configs/logger.config';

export interface SeedData {
  table: string;
  data: any[];
}

export interface SeedOptions {
  truncate?: boolean;
  restartIdentity?: boolean;
}

export class DatabaseSeeder {
  private queryRunner: QueryRunner;

  constructor(queryRunner: QueryRunner) {
    this.queryRunner = queryRunner;
  }

  async seedUserTable(options: SeedOptions = { truncate: true, restartIdentity: true }): Promise<void> {
    try {
      logger.info('🌱 Starting User table seeding...');

      if (options.truncate) {
        await this.truncateTable('user', options.restartIdentity);
      }

      const seedData = this.getUserSeedData();
      
      for (const userData of seedData) {
        const user = new User();
        user.loginID = userData.email; // Use email as loginID
        user.password = await Encryption.generateHash(userData.password, 10);
        
        // Convert userRole string to roleID
        let roleID = 2; // Default to user role
        if (userData.userRole === 'admin') {
          roleID = 1;
        } else if (userData.userRole === 'student') {
          roleID = 6;
        }
        user.roleID = roleID;
        user.status = userData.status || 'active';
        user.isDeleted = userData.isDeleted || false;

        await this.queryRunner.manager.save(user);
        logger.info(`✅ Seeded user: ${userData.email}`);
      }

      logger.info('✅ User table seeding completed');
    } catch (error) {
      logger.error('❌ User table seeding failed:', error);
      throw error;
    }
  }

  private async truncateTable(tableName: string, restartIdentity: boolean = true): Promise<void> {
    try {
      const query = restartIdentity 
        ? `TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`
        : `TRUNCATE TABLE ${tableName}`;
      
      await this.queryRunner.query(query);
      logger.info(`🗑️ Truncated table: ${tableName}`);
    } catch (error) {
      logger.error(`❌ Failed to truncate table ${tableName}:`, error);
      throw error;
    }
  }

  private getUserSeedData() {
    return [
      {
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        userRole: 'admin',
        status: 'active',
        isDeleted: false,
      },
      {
        email: 'john.doe@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        userRole: 'user',
        status: 'active',
        isDeleted: false,
      },
      {
        email: 'jane.smith@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        userRole: 'user',
        status: 'active',
        isDeleted: false,
      },
      {
        email: 'bob.wilson@example.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Wilson',
        userRole: 'user',
        status: 'active',
        isDeleted: false,
      },
      {
        email: 'alice.brown@example.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Brown',
        userRole: 'user',
        status: 'active',
        isDeleted: false,
      },
    ];
  }

  async runAllSeeds(): Promise<void> {
    try {
      logger.info('🌱 Starting database seeding process...');
      
      await this.seedUserTable();
      
      logger.info('✅ All database seeds completed successfully');
    } catch (error) {
      logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}

export const seedDatabase = async (): Promise<void> => {
  try {
    // Import database connection
    const { getConnection } = require('../database/database.config');
    const connection = getConnection();
    
    if (!connection || !connection.isConnected) {
      throw new Error('Database connection not available');
    }

    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    
    const seeder = new DatabaseSeeder(queryRunner);
    await seeder.runAllSeeds();
    
    await queryRunner.release();
  } catch (error) {
    logger.error('❌ Seeding process failed:', error);
    throw error;
  }
};