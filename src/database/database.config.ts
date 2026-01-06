import { createConnection, Connection, getRepository, Repository } from 'typeorm';
import { Student } from '../entities/student/student.entity';
import { ContactDetails } from '../entities/student/contact-details.entity';
import { VisaDetails } from '../entities/student/visa-details.entity';
import { Address } from '../entities/student/address.entity';
import { EligibilityStatus } from '../entities/student/eligibility-status.entity';
import { StudentLifestyle } from '../entities/student/student-lifestyle.entity';
import { PlacementPreferences } from '../entities/student/placement-preferences.entity';
import { FacilityRecords } from '../entities/student/facility-records.entity';
import { AddressChangeRequest } from '../entities/student/address-change-request.entity';
import { JobStatusUpdate } from '../entities/student/job-status-update.entity';
import logger from '../configs/logger.config';

// Global connection variable
let connection: Connection | null = null;

export const initializeDatabase = async (): Promise<Connection> => {
  try {
    if (!connection || !connection.isConnected) {
      connection = await createConnection();
      logger.info('✅ Database connection established successfully');
      
      // Run pending migrations
      await runMigrations();
      
      // Initialize repositories
      await initializeRepositories();
      
      logger.info('✅ Database initialization completed');
    }
    return connection;
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export const runMigrations = async (): Promise<void> => {
  try {
    if (connection) {
      await connection.runMigrations();
      logger.info('✅ Database migrations completed');
    }
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  }
};

export const initializeRepositories = async (): Promise<void> => {
  try {
    // Test repository access
    if (connection) {
      const studentRepository = getRepository(Student);
      logger.info('✅ Repositories initialized');
    }
  } catch (error) {
    logger.error('❌ Repository initialization failed:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (connection && connection.isConnected) {
      await connection.close();
      connection = null;
      logger.info('✅ Database connection closed');
    }
  } catch (error) {
    logger.error('❌ Database close failed:', error);
    throw error;
  }
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!connection || !connection.isConnected) {
      return false;
    }
    
    await connection.query('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

export const getConnection = (): Connection | null => {
  return connection;
};

export const getStudentRepository = (): Repository<Student> => {
  if (!connection || !connection.isConnected) {
    throw new Error('Database not initialized');
  }
  return getRepository(Student);
};

export default connection;