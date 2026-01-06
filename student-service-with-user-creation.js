const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

class StudentService {
  constructor(dbConnection) {
    this.db = dbConnection;
    this.defaultPassword = 'test123';
    this.studentRole = 'Student';
  }

  /**
   * Create a new student with automatic user account creation
   * @param {Object} studentData - Student information
   * @returns {Promise<Object>} - Created student and user credentials
   */
  async createStudentWithUser(studentData) {
    const connection = await this.db.getConnection();
    
    try {
      // Start transaction
      await connection.beginTransaction();

      // Validate required fields
      this.validateRequiredFields(studentData);

      // Create student
      const student = await this.createStudent(connection, studentData);
      
      // Create user account automatically
      const userCredentials = await this.createUserAccount(connection, student, studentData);

      // Commit transaction
      await connection.commit();

      return {
        student: student,
        credentials: userCredentials,
        message: 'Student and user account created successfully'
      };

    } catch (error) {
      // Rollback on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Validate required student fields
   */
  validateRequiredFields(studentData) {
    const required = ['first_name', 'last_name', 'email'];
    const missing = required.filter(field => !studentData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentData.email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Create student record
   */
  async createStudent(connection, studentData) {
    const {
      first_name,
      last_name,
      dob,
      gender,
      nationality,
      student_type,
      status = 'active',
      primary_mobile
    } = studentData;

    // Insert student
    const [studentResult] = await connection.execute(
      `INSERT INTO students (student_id, first_name, last_name, dob, gender, nationality, student_type, status) 
       VALUES (DEFAULT, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, dob, gender, nationality, student_type, status]
    );

    const studentId = studentResult.insertId;

    // Insert contact details if provided
    if (studentData.email) {
      await connection.execute(
        `INSERT INTO contact_details (student_id, email, is_primary, created_at, updated_at) 
         VALUES (?, ?, 1, NOW(), NOW())`,
        [studentId, studentData.email]
      );
    }

    if (primary_mobile) {
      await connection.execute(
        `INSERT INTO contact_details (student_id, mobile, is_primary, created_at, updated_at) 
         VALUES (?, ?, 0, NOW(), NOW())`,
        [studentId, primary_mobile]
      );
    }

    // Return student data
    const [studentDataResult] = await connection.execute(
      `SELECT * FROM students WHERE student_id = ?`,
      [studentId]
    );

    return studentDataResult[0];
  }

  /**
   * Create user account for student
   */
  async createUserAccount(connection, student, studentData) {
    const email = studentData.email;
    
    // Check if user already exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE loginID = ?',
      [email]
    );

    if (existingUser.length > 0) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(this.defaultPassword, 10);

    // Create user account
    const [userResult] = await connection.execute(
      `INSERT INTO users (loginID, password, userRole, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [email, hashedPassword, this.studentRole, student.status]
    );

    const userId = userResult.insertId;

    // Assign Student role
    const [roleResult] = await connection.execute(
      'SELECT role_id FROM roles WHERE role_name = ?',
      [this.studentRole]
    );

    if (roleResult.length === 0) {
      throw new Error(`Role '${this.studentRole}' not found`);
    }

    await connection.execute(
      'INSERT INTO user_roles (user_id, role_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [userId, roleResult[0].role_id]
    );

    return {
      username: email,
      password: this.defaultPassword,
      userId: userId
    };
  }

  /**
   * Create multiple students with user accounts
   * @param {Array} studentsArray - Array of student data
   * @returns {Promise<Object>} - Results with successful and failed entries
   */
  async createMultipleStudentsWithUsers(studentsArray) {
    const results = {
      successful: [],
      failed: []
    };

    for (const studentData of studentsArray) {
      try {
        const result = await this.createStudentWithUser(studentData);
        results.successful.push(result);
      } catch (error) {
        results.failed.push({
          data: studentData,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get student by ID with user account info
   */
  async getStudentWithUser(studentId) {
    const [studentData] = await this.db.execute(
      `SELECT s.*, u.loginID as email, u.id as user_id 
       FROM students s 
       LEFT JOIN contact_details cd ON s.student_id = cd.student_id AND cd.is_primary = 1
       LEFT JOIN users u ON u.loginID = cd.email
       WHERE s.student_id = ?`,
      [studentId]
    );

    return studentData[0];
  }

  /**
   * Get all students with user account status
   */
  async getAllStudentsWithUsers() {
    const [studentsData] = await this.db.execute(
      `SELECT s.*, u.loginID as email, u.status as user_status, u.id as user_id 
       FROM students s 
       LEFT JOIN contact_details cd ON s.student_id = cd.student_id AND cd.is_primary = 1
       LEFT JOIN users u ON u.loginID = cd.email
       ORDER BY s.student_id DESC`
    );

    return studentsData;
  }
}

module.exports = StudentService;