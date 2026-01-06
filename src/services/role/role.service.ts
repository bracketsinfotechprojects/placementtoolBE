import { getRepository } from 'typeorm';
import { User } from '../../entities/user/user.entity';
import { StringError } from '../../errors/string.error';

/**
 * Role Service
 * Centralized service for role management
 */
export default class RoleService {
  /**
   * Get role ID by role name
   * @param roleName - Name of the role (e.g., 'admin', 'student', 'user')
   * @returns Role ID
   */
  static async getRoleIdByName(roleName: string): Promise<number> {
    const queryRunner = getRepository(User).manager.connection.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const roles = await queryRunner.query(
        'SELECT role_id FROM roles WHERE role_name = ?',
        [roleName]
      );
      
      if (!roles || roles.length === 0) {
        throw new StringError(`Role '${roleName}' not found in database`);
      }
      
      return roles[0].role_id;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get role name by role ID
   * @param roleId - Role ID
   * @returns Role name
   */
  static async getRoleNameById(roleId: number): Promise<string> {
    const queryRunner = getRepository(User).manager.connection.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const roles = await queryRunner.query(
        'SELECT role_name FROM roles WHERE role_id = ?',
        [roleId]
      );
      
      if (!roles || roles.length === 0) {
        throw new StringError(`Role with ID '${roleId}' not found in database`);
      }
      
      return roles[0].role_name;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Check if role exists
   * @param roleName - Name of the role
   * @returns True if role exists
   */
  static async roleExists(roleName: string): Promise<boolean> {
    try {
      await this.getRoleIdByName(roleName);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all roles
   * @returns Array of roles
   */
  static async getAllRoles(): Promise<Array<{ role_id: number; role_name: string }>> {
    const queryRunner = getRepository(User).manager.connection.createQueryRunner();
    await queryRunner.connect();
    
    try {
      const roles = await queryRunner.query('SELECT role_id, role_name FROM roles');
      return roles;
    } finally {
      await queryRunner.release();
    }
  }
}
