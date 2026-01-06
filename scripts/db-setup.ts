#!/usr/bin/env ts-node
import 'dotenv/config';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { DatabaseSeeder } from '../src/database/database.seeder';
import { DatabaseManager } from '../src/database/database.manager';
import logger from '../src/configs/logger.config';

interface Command {
  name: string;
  description: string;
  action: () => Promise<void>;
}

class DatabaseSetup {
  private connection: any;

  async connect(): Promise<void> {
    try {
      this.connection = await createConnection();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      logger.info('✅ Database disconnected');
    }
  }

  async runMigrations(): Promise<void> {
    try {
      await this.connection.runMigrations();
      logger.info('✅ Migrations run successfully');
    } catch (error) {
      logger.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async revertMigrations(): Promise<void> {
    try {
      await this.connection.undoLastMigration();
      logger.info('✅ Last migration reverted successfully');
    } catch (error) {
      logger.error('❌ Migration revert failed:', error);
      throw error;
    }
  }

  async seed(): Promise<void> {
    try {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      
      const seeder = new DatabaseSeeder(queryRunner);
      await seeder.runAllSeeds();
      
      await queryRunner.release();
      logger.info('✅ Database seeded successfully');
    } catch (error) {
      logger.error('❌ Seeding failed:', error);
      throw error;
    }
  }

  async showTables(): Promise<void> {
    try {
      const manager = new DatabaseManager(this.connection);
      const tables = await manager.showTables();
      logger.info('📋 Database tables:');
      tables.forEach(table => logger.info(`  - ${table}`));
    } catch (error) {
      logger.error('❌ Failed to show tables:', error);
    }
  }

  async showTableInfo(tableName: string): Promise<void> {
    try {
      const manager = new DatabaseManager(this.connection);
      const exists = await manager.tableExists(tableName);
      
      if (!exists) {
        logger.warn(`⚠️ Table '${tableName}' does not exist`);
        return;
      }

      const stats = await manager.getTableStats(tableName);
      logger.info(`📊 Table '${tableName}' stats:`, stats);
    } catch (error) {
      logger.error(`❌ Failed to get table info for '${tableName}':`, error);
    }
  }

  async dropDatabase(): Promise<void> {
    try {
      const manager = new DatabaseManager(this.connection);
      await manager.dropDatabase();
      logger.warn('⚠️ Database dropped successfully');
    } catch (error) {
      logger.error('❌ Failed to drop database:', error);
      throw error;
    }
  }

  async getDbSize(): Promise<void> {
    try {
      const manager = new DatabaseManager(this.connection);
      const size = await manager.getDatabaseSize();
      logger.info(`📊 Database size: ${size} MB`);
    } catch (error) {
      logger.error('❌ Failed to get database size:', error);
    }
  }
}

async function main() {
  const setup = new DatabaseSetup();
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    await setup.connect();

    switch (command) {
      case 'migrate':
        await setup.runMigrations();
        break;
      
      case 'revert':
        await setup.revertMigrations();
        break;
      
      case 'seed':
        await setup.seed();
        break;
      
      case 'tables':
        await setup.showTables();
        break;
      
      case 'table':
        const tableName = args[1];
        if (!tableName) {
          logger.error('❌ Please specify table name: npm run db:table <table_name>');
          process.exit(1);
        }
        await setup.showTableInfo(tableName);
        break;
      
      case 'size':
        await setup.getDbSize();
        break;
      
      case 'drop':
        logger.warn('⚠️ This will permanently delete the database!');
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        readline.question('Are you sure? Type "yes" to confirm: ', async (answer: string) => {
          if (answer === 'yes') {
            await setup.dropDatabase();
          } else {
            logger.info('Operation cancelled');
          }
          readline.close();
          await setup.disconnect();
          process.exit(0);
        });
        return;
      
      case 'help':
      default:
        logger.info(`
📚 Database Setup Commands:
  npm run db:migrate     - Run all pending migrations
  npm run db:revert      - Revert last migration
  npm run db:seed        - Seed database with sample data
  npm run db:tables      - Show all tables
  npm run db:table <name> - Show table information
  npm run db:size        - Show database size
  npm run db:drop        - Drop entire database (DANGEROUS!)
        `);
        break;
    }

    await setup.disconnect();
  } catch (error) {
    logger.error('❌ Command failed:', error);
    await setup.disconnect();
    process.exit(1);
  }
}

main();