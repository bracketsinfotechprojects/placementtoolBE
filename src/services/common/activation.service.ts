import { getRepository } from 'typeorm';

// Entities
import { Student } from '../../entities/student/student.entity';
import { User } from '../../entities/user/user.entity';
import { Facility } from '../../entities/facility/facility.entity';

// Errors
import { StringError } from '../../errors/string.error';

/**
 * Generic activation/deactivation service
 * Works for any table with isDeleted field
 */

// Map of table names to their entities, primary keys, and user linking configuration
const TABLE_CONFIG: { 
  [key: string]: { 
    entity: any; 
    primaryKey: string; 
    roleID?: number; 
    userLinkField?: string;
  } 
} = {
  students: { 
    entity: Student, 
    primaryKey: 'student_id', 
    roleID: 6, 
    userLinkField: 'studentID' 
  },
  facilities: { 
    entity: Facility, 
    primaryKey: 'facility_id', 
    roleID: 2, 
    userLinkField: 'facilityID'
  },
  facility: { // Alias for facilities (singular form)
    entity: Facility, 
    primaryKey: 'facility_id', 
    roleID: 2, 
    userLinkField: 'facilityID'
  },
  users: { 
    entity: User, 
    primaryKey: 'id', 
    roleID: null, 
    userLinkField: null 
  }
  // Future role-based tables (uncomment when entities are created):
  // supervisors: { 
  //   entity: Supervisor, 
  //   primaryKey: 'supervisor_id', 
  //   roleID: 3, 
  //   userLinkField: 'supervisorID' 
  // },
  // placement_executives: { 
  //   entity: PlacementExecutive, 
  //   primaryKey: 'placement_executive_id', 
  //   roleID: 4, 
  //   userLinkField: 'placementExecutiveID' 
  // },
  // trainers: { 
  //   entity: Trainer, 
  //   primaryKey: 'trainer_id', 
  //   roleID: 5, 
  //   userLinkField: 'trainerID' 
  // }
};

/**
 * Toggle activation status for any table
 * @param tableName - Name of the table (e.g., 'students', 'users', 'facilities')
 * @param id - Record ID
 * @param activate - true to activate (isDeleted=0), false to deactivate (isDeleted=1)
 */
const toggleActivation = async (tableName: string, id: number, activate: boolean): Promise<{ message: string }> => {
  // Validate table name
  const tableConfig = TABLE_CONFIG[tableName.toLowerCase()];
  if (!tableConfig) {
    throw new StringError(`Table '${tableName}' is not supported for activation`);
  }

  const { entity, primaryKey, roleID, userLinkField } = tableConfig;
  const repo = getRepository(entity);

  console.log(`🔧 Activation request: table=${tableName}, id=${id}, activate=${activate}`);

  // Check if record exists
  const record = await repo.findOne({
    where: { [primaryKey]: id }
  });

  if (!record) {
    throw new StringError(`${tableName.slice(0, -1)} not found`);
  }

  console.log(`✅ Record found`);

  // Update the main table using raw query to ensure it commits
  const isDeleted = !activate ? 1 : 0; // activate=true → isDeleted=0, activate=false → isDeleted=1
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  console.log(`📝 Executing: UPDATE ${tableName} SET isDeleted=${isDeleted}, updatedAt='${now}' WHERE ${primaryKey}=${id}`);
  
  const connection = repo.manager.connection;
  await connection.query(
    `UPDATE ${tableName} SET isDeleted = ?, updatedAt = ? WHERE ${primaryKey} = ?`,
    [isDeleted, now, id]
  );

  console.log(`✅ Main table updated`);

  const action = activate ? 'activated' : 'deactivated';
  let message = `User ${action}`;

  // If this table has a role link, also update users table
  if (roleID && userLinkField) {
    console.log(`📝 Executing: UPDATE users SET isDeleted=${isDeleted}, updatedAt='${now}' WHERE roleID=${roleID} AND ${userLinkField}=${id}`);
    
    const userUpdateResult = await connection.query(
      `UPDATE users SET isDeleted = ?, updatedAt = ? WHERE roleID = ? AND ${userLinkField} = ?`,
      [isDeleted, now, roleID, id]
    );

    console.log(`✅ Users table updated: affected=${userUpdateResult.affectedRows}`);

    if (userUpdateResult.affectedRows > 0) {
      console.log(`✅ ${tableName} ${id} and associated user account (roleID=${roleID}) ${action} successfully`);
    } else {
      console.log(`⚠️ ${tableName} ${id} ${action} successfully (no user account found with roleID=${roleID} and ${userLinkField}=${id})`);
    }
  } else {
    console.log(`✅ ${tableName} ${id} ${action} successfully`);
  }

  // Verify the update with raw query
  const verifyResult = await connection.query(
    `SELECT isDeleted FROM ${tableName} WHERE ${primaryKey} = ?`,
    [id]
  );
  console.log(`🔍 Verification - isDeleted after update: ${verifyResult[0]?.isDeleted}`);

  return { message };
};

export default {
  toggleActivation
};
