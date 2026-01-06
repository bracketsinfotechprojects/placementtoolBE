import { Connection } from 'typeorm';
import logger from '../configs/logger.config';

export class DatabaseManager {
  private connection: Connection | null = null;

  constructor(connection?: Connection) {
    this.connection = connection || null;
  }

  async createDatabase(): Promise<void> {
    try {
      // This would require a separate connection without specifying a database
      logger.info('Database creation is typically done via MySQL admin tools or migrations');
    } catch (error) {
      logger.error('Database creation failed:', error);
      throw error;
    }
  }

  async dropDatabase(): Promise<void> {
    try {
      if (this.connection) {
        // Warning: This is destructive!
        await this.connection.query('DROP DATABASE IF EXISTS `' + (process.env.DB_NAME || 'nodejs-sample') + '`');
        logger.warn('⚠️ Database dropped successfully');
      }
    } catch (error) {
      logger.error('Database drop failed:', error);
      throw error;
    }
  }

  async createTables(): Promise<void> {
    try {
      if (this.connection) {
        // Synchronize will create tables based on entities (use with caution in production)
        if (process.env.NODE_ENV === 'development') {
          await this.connection.synchronize();
          logger.info('✅ Tables created successfully via synchronize');
        } else {
          logger.warn('⚠️ Table synchronization is disabled in production');
        }
      }
    } catch (error) {
      logger.error('Table creation failed:', error);
      throw error;
    }
  }

  async dropTables(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.dropDatabase();
        logger.warn('⚠️ All tables dropped successfully');
      }
    } catch (error) {
      logger.error('Table drop failed:', error);
      throw error;
    }
  }

  async showTables(): Promise<string[]> {
    try {
      if (this.connection) {
        const result = await this.connection.query('SHOW TABLES');
        return result.map((row: any) => Object.values(row)[0]);
      }
      return [];
    } catch (error) {
      logger.error('Failed to show tables:', error);
      return [];
    }
  }

  async describeTable(tableName: string): Promise<any[]> {
    try {
      if (this.connection) {
        return await this.connection.query(`DESCRIBE \`${tableName}\``);
      }
      return [];
    } catch (error) {
      logger.error(`Failed to describe table ${tableName}:`, error);
      return [];
    }
  }

  async tableExists(tableName: string): Promise<boolean> {
    try {
      if (this.connection) {
        const result = await this.connection.query(
          'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
          [process.env.DB_NAME || 'nodejs-sample', tableName]
        );
        return result[0].count > 0;
      }
      return false;
    } catch (error) {
      logger.error(`Failed to check if table ${tableName} exists:`, error);
      return false;
    }
  }

  async getTableStats(tableName: string): Promise<any> {
    try {
      if (this.connection) {
        const stats = await this.connection.query(`
          SELECT 
            table_rows,
            data_length,
            index_length,
            data_free,
            auto_increment,
            create_time,
            update_time
          FROM information_schema.tables 
          WHERE table_schema = ? AND table_name = ?
        `, [process.env.DB_NAME || 'nodejs-sample', tableName]);
        
        return stats[0] || {};
      }
      return {};
    } catch (error) {
      logger.error(`Failed to get table stats for ${tableName}:`, error);
      return {};
    }
  }

  async optimizeTable(tableName: string): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.query(`OPTIMIZE TABLE \`${tableName}\``);
        logger.info(`✅ Table ${tableName} optimized successfully`);
      }
    } catch (error) {
      logger.error(`Failed to optimize table ${tableName}:`, error);
      throw error;
    }
  }

  async getDatabaseSize(): Promise<number> {
    try {
      if (this.connection) {
        const result = await this.connection.query(`
          SELECT 
            ROUND(SUM(data_length + index_length) / 1024 / 1024, 1) AS 'DB Size in MB'
          FROM information_schema.tables 
          WHERE table_schema = ?
        `, [process.env.DB_NAME || 'nodejs-sample']);
        
        return result[0]['DB Size in MB'] || 0;
      }
      return 0;
    } catch (error) {
      logger.error('Failed to get database size:', error);
      return 0;
    }
  }

  async execute(sql: string, parameters?: any[]): Promise<any> {
    try {
      if (!this.connection) {
        throw new Error('Database connection not established.');
      }
      return await this.connection.query(sql, parameters);
    } catch (error) {
      logger.error('Error executing query:', error);
      throw error;
    }
  }

  public getConnection(): Connection {
    if (!this.connection) {
      throw new Error('Database connection not established.');
    }
    return this.connection;
  }
}

export default DatabaseManager;