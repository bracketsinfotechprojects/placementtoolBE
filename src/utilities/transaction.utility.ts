import { getConnection, QueryRunner } from 'typeorm';

/**
 * Transaction Utility
 * Provides helper methods for database transactions
 */
export default class TransactionUtility {
  /**
   * Execute operations within a transaction
   * Automatically handles commit/rollback
   * @param callback - Function to execute within transaction
   * @returns Result of the callback
   */
  static async executeInTransaction<T>(
    callback: (queryRunner: QueryRunner) => Promise<T>
  ): Promise<T> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Execute a query within a transaction
   * @param query - SQL query
   * @param parameters - Query parameters
   * @returns Query result
   */
  static async query<T = any>(query: string, parameters?: any[]): Promise<T> {
    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();

    try {
      return await queryRunner.query(query, parameters);
    } finally {
      await queryRunner.release();
    }
  }
}
