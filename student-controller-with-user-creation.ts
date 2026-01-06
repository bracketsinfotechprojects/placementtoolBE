// Student Controller with Automatic User Account Creation
// TypeScript implementation for integration with existing CRM codebase

import { Request, Response } from 'express';
import { DatabaseManager as Database } from './src/database/database.manager';
import bcrypt from 'bcrypt';
import { QueryRunner } from 'typeorm';

interface CreateStudentRequest {
  first_name: string;
  last_name: string;
  dob: string;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status?: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  email: string;
  primary_mobile?: string;
}

interface StudentWithUser {
  student_id: number;
  first_name: string;
  last_name: string;
  dob: string;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status: string;
  email?: string;
  primary_mobile?: string;
  loginID?: string;
  user_status?: string;
  userRole?: string;
  roles?: string;
}

export class StudentController {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Create a new student with automatic user account creation
   * POST /api/students
   */
  async createStudentWithUser(req: Request, res: Response): Promise<void> {
    try {
      const studentData: CreateStudentRequest = req.body;

      // Validate required fields
      this.validateStudentData(studentData);

      const result = await this.createStudentWithUserInternal(studentData);

      res.status(201).json({
        success: true,
        message: 'Student and user account created successfully',
        data: result
      });

    } catch (error) {
      console.error('Error creating student with user:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create student with user account'
      });
    }
  }

  /**
   * Create multiple students with user accounts
   * POST /api/students/bulk
   */
  async createMultipleStudents(req: Request, res: Response): Promise<void> {
    try {
      const studentsData: CreateStudentRequest[] = req.body.students;

      if (!Array.isArray(studentsData) || studentsData.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid students data provided'
        });
        return;
      }

      // Validate all student data
      for (const studentData of studentsData) {
        this.validateStudentData(studentData);
      }

      const results = await this.createMultipleStudentsInternal(studentsData);

      res.status(201).json({
        success: true,
        message: `Bulk creation completed. ${results.successful.length} successful, ${results.failed.length} failed`,
        data: results
      });

    } catch (error) {
      console.error('Error creating multiple students:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create multiple students'
      });
    }
  }

  /**
   * Get student with user account information
   * GET /api/students/:id/with-user
   */
  async getStudentWithUser(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.id);

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
        return;
      }

      const student = await this.getStudentWithUserInternal(studentId);

      if (!student) {
        res.status(404).json({
          success: false,
          message: 'Student not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: student
      });

    } catch (error) {
      console.error('Error fetching student with user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student information'
      });
    }
  }

  /**
   * Update student and corresponding user account
   * PUT /api/students/:id/with-user
   */
  async updateStudentWithUser(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.id);
      const updateData = req.body;

      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid student ID'
        });
        return;
      }

      const result = await this.updateStudentWithUserInternal(studentId, updateData);

      res.status(200).json({
        success: true,
        message: 'Student and user account updated successfully',
        data: result
      });

    } catch (error) {
      console.error('Error updating student with user:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update student with user account'
      });
    }
  }

  // Private helper methods

  private validateStudentData(studentData: CreateStudentRequest): void {
    const { first_name, last_name, dob, email } = studentData;

    if (!first_name?.trim()) {
      throw new Error('First name is required');
    }

    if (!last_name?.trim()) {
      throw new Error('Last name is required');
    }

    if (!dob) {
      throw new Error('Date of birth is required');
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) {
      throw new Error('Date of birth must be in YYYY-MM-DD format');
    }

    if (!email?.trim()) {
      throw new Error('Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  private async createStudentWithUserInternal(studentData: CreateStudentRequest) {
    const connection = this.db.getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.startTransaction();

      const {
        first_name,
        last_name,
        dob,
        gender,
        nationality,
        student_type,
        status = 'active',
        email,
        primary_mobile
      } = studentData;

      console.log(`📝 Creating student: ${first_name} ${last_name} with email: ${email}`);

      // Step 1: Create student record
      const [studentResult] = await queryRunner.query(
        `INSERT INTO students (
          first_name, last_name, dob, gender, nationality, student_type, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, dob, gender, nationality, student_type, status]
      );

      const studentId = (studentResult as any).insertId;
      console.log(`✅ Student created with ID: ${studentId}`);

      // Step 2: Create contact details with email
      await queryRunner.query(
        `INSERT INTO contact_details (
          student_id, email, primary_mobile, contact_type, is_primary
        ) VALUES (?, ?, ?, ?, ?)`,
        [studentId, email, primary_mobile, 'mobile', 1]
      );
      console.log(`✅ Contact details created for: ${email}`);

      // Step 3: Get Student role ID
      const [roles] = await queryRunner.query(
        'SELECT role_id FROM roles WHERE role_name = ?',
        ['Student']
      );

      if ((roles as any).length === 0) {
        throw new Error('Student role not found in database');
      }

      const studentRoleId = (roles as any)[0].role_id;

      // Step 4: Create user account with email as loginID
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      const [userResult] = await queryRunner.query(
        'INSERT INTO users (loginID, password, userRole, status) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, 'Student', status]
      );

      const userId = (userResult as any).insertId;
      console.log(`✅ User account created: ${email}`);

      // Step 5: Link user to Student role
      await queryRunner.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, studentRoleId]
      );

      // Step 6: Verify the creation
      const [verification] = await queryRunner.query(
        `SELECT 
          s.student_id,
          s.first_name,
          s.last_name,
          cd.email,
          u.loginID,
          u.status as user_status,
          r.role_name
        FROM students s
        JOIN contact_details cd ON s.student_id = cd.student_id AND cd.is_primary = 1
        JOIN users u ON u.loginID = cd.email
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.role_id
        WHERE s.student_id = ?`,
        [studentId]
      );

      await queryRunner.commitTransaction();

      console.log('🎉 Student and user account created successfully!');
      console.log('🔑 Login Credentials:');
      console.log(`   Username: ${email}`);
      console.log(`   Password: test123`);

      return {
        student: (verification as any)[0],
        credentials: {
          username: email,
          password: 'test123'
        }
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error creating student with user:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createMultipleStudentsInternal(studentsData: CreateStudentRequest[]) {
    const results: {
      successful: (StudentWithUser | { student: any; credentials: { username: string; password: string; }; })[];
      failed: { studentData: CreateStudentRequest; error: string }[];
    } = {
      successful: [],
      failed: []
    };

    for (const studentData of studentsData) {
      try {
        const result = await this.createStudentWithUserInternal(studentData);
        results.successful.push(result);
      } catch (error) {
        results.failed.push({
          studentData,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  private async getStudentWithUserInternal(studentId: number): Promise<StudentWithUser | null> {
    try {
      const [student] = await this.db.execute(
        `SELECT 
          s.*,
          cd.email,
          cd.primary_mobile,
          u.loginID,
          u.status as user_status,
          u.userRole,
          GROUP_CONCAT(r.role_name SEPARATOR ', ') as roles
        FROM students s
        LEFT JOIN contact_details cd ON s.student_id = cd.student_id AND cd.is_primary = 1
        LEFT JOIN users u ON u.loginID = cd.email
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE s.student_id = ?
        GROUP BY s.student_id`,
        [studentId]
      );

      return (student as any)[0] || null;
    } catch (error) {
      console.error('Error fetching student with user:', error);
      throw error;
    }
  }

  private async updateStudentWithUserInternal(studentId: number, updateData: any) {
    const connection = this.db.getConnection();
    const queryRunner = connection.createQueryRunner();

    try {
      await queryRunner.startTransaction();

      // Update student information
      const studentFields = [];
      const studentValues: (string | number | boolean | null)[] = [];
      
      const allowedStudentFields = ['first_name', 'last_name', 'dob', 'gender', 'nationality', 'student_type', 'status'];
      
      for (const [key, valueUntyped] of Object.entries(updateData)) {
        if (allowedStudentFields.includes(key)) {
          studentFields.push(`${key} = ?`);
          const value: string | number | boolean | null = valueUntyped as (string | number | boolean | null);
          studentValues.push(value);
        }
      }

      if (studentFields.length > 0) {
        studentValues.push(studentId);
        await queryRunner.query(
          `UPDATE students SET ${studentFields.join(', ')} WHERE student_id = ?`,
          studentValues as (string | number | boolean | null)[]
        );
      }

      // Update contact details if email or mobile is provided
      const allowedContactFields = ['email', 'primary_mobile'];
      const contactFields: string[] = [];
      const contactValues: (string | number | boolean | null)[] = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedContactFields.includes(key)) {
          contactFields.push(`${key} = ?`);
          contactValues.push(value as (string | number | boolean | null));
        }
      }

      if (contactFields.length > 0) {
        contactValues.push(studentId);
        await queryRunner.query(
          `UPDATE contact_details SET ${contactFields.join(', ')} WHERE student_id = ? AND is_primary = 1`,
          contactValues as (string | number | boolean | null)[]
        );

        // If email changed, update user loginID
        if (updateData.email) {
          await queryRunner.query(
            'UPDATE users SET loginID = ? WHERE loginID = (SELECT email FROM contact_details WHERE student_id = ? AND is_primary = 1)',
            [updateData.email, studentId]
          );
        }
      }

      await queryRunner.commitTransaction();
      
      return {
        success: true,
        message: 'Student and user account updated successfully'
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error updating student with user:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

// Export for use in routes
export default StudentController;