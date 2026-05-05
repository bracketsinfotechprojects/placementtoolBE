import { getRepository, getConnection } from 'typeorm';
import { Student } from '../../entities/student/student.entity';
import { User } from '../../entities/user/user.entity';
import RoleService from '../role/role.service';
import ApiUtility from '../../utilities/api.utility';
import { StringError } from '../../errors/string.error';
import { IDetailById } from '../../interfaces/common.interface';
import { IStudentQueryParams, IAdvancedSearchParams } from './student.interfaces';

const baseWhere = { isDeleted: false };

/**
 * Student Query Service
 * Handles all read operations for students
 */
class StudentQueryService {
  /**
   * Get student by ID with location
   */
  async getById(params: IDetailById) {
    try {
      const data = await getRepository(Student).findOne({
        where: { student_id: params.id },
      });

      if (!data) return null;

      const locationData: any[] = await getConnection().query(
        `SELECT ST_X(location) as longitude, ST_Y(location) as latitude FROM students WHERE student_id = ?`,
        [params.id]
      );

      const sanitized: any = ApiUtility.sanitizeStudent(data);

      if (locationData && locationData[0]) {
        sanitized.latitude = locationData[0].latitude;
        sanitized.longitude = locationData[0].longitude;
      }

      return sanitized;
    } catch (e) {
      return null;
    }
  }

  /**
   * Get student detail with validation
   */
  async detail(params: IDetailById) {
    const query = {
      where: { ...baseWhere, student_id: params.id },
    };

    const student = await getRepository(Student).findOne(query);
    if (!student) {
      throw new StringError('Student does not exist');
    }

    return ApiUtility.sanitizeStudent(student);
  }

  /**
   * Get all student details with relations and user account
   */
  async getAllDetails(params: IDetailById) {
    try {
      const student = await getRepository(Student).findOne({
        where: { student_id: params.id, isDeleted: false },
        relations: [
          'contact_details',
          'visa_details',
          'addresses',
          'eligibility_status',
          'student_lifestyle',
          'placement_preferences',
          'facility_records',
          'address_change_requests',
          'job_status_updates'
        ]
      });

      if (!student) {
        throw new StringError('Student does not exist');
      }

      const sanitizedStudent: any = ApiUtility.sanitizeStudent(student);

      const locationData: any[] = await getConnection().query(
        `SELECT ST_X(location) as longitude, ST_Y(location) as latitude FROM students WHERE student_id = ?`,
        [params.id]
      );

      if (locationData && locationData[0]) {
        sanitizedStudent.latitude = locationData[0].latitude;
        sanitizedStudent.longitude = locationData[0].longitude;
      }

      let userDetails = null;
      if (student.contact_details && student.contact_details.length > 0) {
        const primaryEmail = student.contact_details.find((cd: any) => cd.email)?.email;
        if (primaryEmail) {
          try {
            const user = await getRepository(User).findOne({
              where: { loginID: primaryEmail },
              select: ['id', 'loginID', 'roleID', 'status', 'createdAt', 'updatedAt']
            });

            if (user) {
              const roleName = await RoleService.getRoleNameById(user.roleID);

              userDetails = {
                id: user.id,
                loginID: user.loginID,
                roleID: user.roleID,
                roleName: roleName,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
              };
            }
          } catch (userError) {
            console.log('⚠️ Could not fetch user details for student:', userError.message);
          }
        }
      }

      return {
        ...sanitizedStudent,
        user_account: userDetails
      };
    } catch (error) {
      if (error instanceof StringError) {
        throw error;
      }
      console.error('Error in getAllDetails:', error);
      throw new StringError('Failed to retrieve student details');
    }
  }

  /**
   * Get students list with specific fields
   */
  async getStudentsList(params: IStudentQueryParams) {
    const studentRepo = getRepository(Student).createQueryBuilder('student')
      .leftJoinAndSelect('student.addresses', 'address', 'address.is_primary = :isPrimary', { isPrimary: true })
      .leftJoinAndSelect('student.contact_details', 'contact')
      .leftJoinAndSelect('student.eligibility_status', 'eligibility')
      .leftJoinAndSelect('student.facility_records', 'facility');

    this.applyActivationFilter(studentRepo, params.activation_status);
    this.applyFilters(studentRepo, params);

    const sortBy = params.sort_by || 'createdAt';
    const sortOrder = params.sort_order === 'asc' ? 'ASC' : 'DESC';
    studentRepo.orderBy(`student.${sortBy}`, sortOrder);

    const total = await studentRepo.getCount();
    const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

    studentRepo
      .limit(params.limit || 10)
      .offset(ApiUtility.getOffset(params.limit, params.page));

    const students = await studentRepo.getMany();

    const response = this.formatStudentsList(students);
    let filteredResponse = this.applyPostQueryFilters(response, params);

    if (params.course_completed || params.checklist_approval) {
      const filteredTotal = filteredResponse.length;
      const updatedPagRes = ApiUtility.getPagination(filteredTotal, params.limit, params.page);

      const start = ApiUtility.getOffset(params.limit, params.page);
      const end = start + (params.limit || 10);
      filteredResponse = filteredResponse.slice(start, end);

      return { response: filteredResponse, pagination: updatedPagRes.pagination };
    }

    return { response: filteredResponse, pagination: pagRes.pagination };
  }

  /**
   * List students with pagination and filtering
   */
  async list(params: IStudentQueryParams) {
    let studentRepo = getRepository(Student).createQueryBuilder('student');

    this.applyActivationFilter(studentRepo, params.activation_status);

    if (params.keyword) {
      studentRepo = studentRepo.andWhere(
        '(LOWER(student.first_name) LIKE LOWER(:keyword) OR LOWER(student.last_name) LIKE LOWER(:keyword) OR student.student_id LIKE :keyword)',
        { keyword: `%${params.keyword}%` },
      );
    }

    if (params.status) {
      studentRepo = studentRepo.andWhere('student.status = :status', { status: params.status });
    }

    if (params.student_type) {
      studentRepo = studentRepo.andWhere('student.student_type = :student_type', {
        student_type: params.student_type
      });
    }

    if (params.nationality) {
      studentRepo = studentRepo.andWhere('student.nationality = :nationality', {
        nationality: params.nationality
      });
    }

    const sortBy = params.sort_by || 'student_id';
    const sortOrder = params.sort_order === 'asc' ? 'ASC' : 'DESC';
    studentRepo = studentRepo.orderBy(sortBy, sortOrder);

    const total = await studentRepo.getMany();
    const pagRes = ApiUtility.getPagination(total.length, params.limit, params.page);

    studentRepo = studentRepo
      .limit(params.limit)
      .offset(ApiUtility.getOffset(params.limit, params.page));

    const students = await studentRepo.getMany();

    const response = [];
    if (students && students.length) {
      const studentIds = students.map(s => s.student_id);

      const locationData: any[] = await getConnection().query(
        `SELECT student_id, ST_X(location) as longitude, ST_Y(location) as latitude 
         FROM students WHERE student_id IN (?)`,
        [studentIds]
      );

      const locationMap = new Map();
      locationData.forEach((loc: any) => {
        locationMap.set(loc.student_id, { latitude: loc.latitude, longitude: loc.longitude });
      });

      for (const item of students) {
        const sanitized: any = ApiUtility.sanitizeStudent(item);
        const location = locationMap.get(item.student_id);
        if (location) {
          sanitized.latitude = location.latitude;
          sanitized.longitude = location.longitude;
        }
        response.push(sanitized);
      }
    }

    return { response, pagination: pagRes.pagination };
  }

  /**
   * Advanced search for students
   */
  async advancedSearch(params: IAdvancedSearchParams) {
    let studentRepo = getRepository(Student).createQueryBuilder('student');

    this.applyActivationFilter(studentRepo, params.activation_status);

    if (params.name) {
      studentRepo = studentRepo.andWhere(
        '(LOWER(student.first_name) LIKE LOWER(:name) OR LOWER(student.last_name) LIKE LOWER(:name))',
        { name: `%${params.name}%` }
      );
    }

    if (params.nationality) {
      studentRepo = studentRepo.andWhere('student.nationality = :nationality', { nationality: params.nationality });
    }

    if (params.student_type) {
      studentRepo = studentRepo.andWhere('student.student_type = :student_type', { student_type: params.student_type });
    }

    if (params.status) {
      studentRepo = studentRepo.andWhere('student.status = :status', { status: params.status });
    }

    if (params.min_age) {
      const minDob = new Date();
      minDob.setFullYear(minDob.getFullYear() - params.min_age);
      studentRepo = studentRepo.andWhere('student.dob <= :minDob', { minDob });
    }

    if (params.max_age) {
      const maxDob = new Date();
      maxDob.setFullYear(maxDob.getFullYear() - params.max_age);
      studentRepo = studentRepo.andWhere('student.dob >= :maxDob', { maxDob });
    }

    if (params.has_visa !== undefined) {
      if (params.has_visa) {
        studentRepo = studentRepo.innerJoinAndSelect('student.visa_details', 'visa');
      } else {
        studentRepo = studentRepo.leftJoinAndSelect('student.visa_details', 'visa');
        studentRepo = studentRepo.andWhere('visa.vis_id IS NULL');
      }
    }

    const total = await studentRepo.getMany();
    const pagRes = ApiUtility.getPagination(total.length, params.limit, params.page);

    studentRepo = studentRepo
      .limit(params.limit)
      .offset(ApiUtility.getOffset(params.limit, params.page));

    const students = await studentRepo.getMany();

    const response = [];
    if (students && students.length) {
      for (const item of students) {
        response.push(ApiUtility.sanitizeStudent(item));
      }
    }

    return { response, pagination: pagRes.pagination };
  }

  /**
   * Get student statistics
   */
  async getStatistics() {
    const studentRepo = getRepository(Student);

    const [
      totalStudents,
      activeStudents,
      internationalStudents,
      graduatedStudents,
      inactiveStudents
    ] = await Promise.all([
      studentRepo.count({ where: { isDeleted: false } }),
      studentRepo.count({ where: { ...baseWhere, status: 'active' } }),
      studentRepo.count({ where: { ...baseWhere, student_type: 'international' } }),
      studentRepo.count({ where: { ...baseWhere, status: 'graduated' } }),
      studentRepo.count({ where: { ...baseWhere, status: 'inactive' } })
    ]);

    return {
      total_students: totalStudents,
      active_students: activeStudents,
      international_students: internationalStudents,
      graduated_students: graduatedStudents,
      inactive_students: inactiveStudents,
      domestic_students: totalStudents - internationalStudents
    };
  }

  /**
   * Get student with user account details
   */
  async getWithUserDetails(studentId: number) {
    const student = await this.getById({ id: studentId });
    if (!student) {
      throw new StringError('Student not found');
    }

    let userDetails = null;
    if (student.contact_details && student.contact_details.length > 0) {
      const primaryEmail = student.contact_details.find((cd: any) => cd.email)?.email;
      if (primaryEmail) {
        try {
          const user = await getRepository(User).findOne({
            where: { loginID: primaryEmail },
            select: ['id', 'loginID', 'roleID', 'status', 'createdAt', 'updatedAt']
          });

          if (user) {
            const roleName = await RoleService.getRoleNameById(user.roleID);

            userDetails = {
              id: user.id,
              loginID: user.loginID,
              roleID: user.roleID,
              roleName: roleName,
              status: user.status,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            };
          }
        } catch (userError) {
          console.log('⚠️ Could not fetch user details:', userError.message);
        }
      }
    }

    return {
      ...student,
      user_account: userDetails
    };
  }

  // Helper methods
  private applyActivationFilter(queryBuilder: any, activationStatus?: string) {
    if (activationStatus === 'active') {
      queryBuilder.where('student.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('student.status != :inactiveStatus', { inactiveStatus: 'inactive' });
    } else if (activationStatus === 'inactive') {
      queryBuilder.where('(student.isDeleted = :isDeleted OR student.status = :inactiveStatus)',
        { isDeleted: true, inactiveStatus: 'inactive' });
    } else if (activationStatus === 'all') {
      // No filter
    } else {
      queryBuilder.where('student.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('student.status != :inactiveStatus', { inactiveStatus: 'inactive' });
    }
  }

  private applyFilters(queryBuilder: any, params: IStudentQueryParams) {
    const parseFilterValues = (value: string | string[] | undefined): string[] | null => {
      if (!value) return null;
      if (Array.isArray(value)) return value;
      return value.split(',').map(v => v.trim()).filter(v => v);
    };

    const statusValues = parseFilterValues(params.status);
    if (statusValues && statusValues.length > 0) {
      queryBuilder.andWhere('student.status IN (:...statuses)', { statuses: statusValues });
    }

    const studentTypeValues = parseFilterValues(params.student_type);
    if (studentTypeValues && studentTypeValues.length > 0) {
      queryBuilder.andWhere('student.student_type IN (:...studentTypes)', { studentTypes: studentTypeValues });
    }

    const cityValues = parseFilterValues(params.city);
    if (cityValues && cityValues.length > 0) {
      queryBuilder.andWhere('address.city IN (:...cities)', { cities: cityValues });
    }

    if (params.keyword) {
      const keywords = params.keyword.split(',').map(k => k.trim()).filter(k => k);

      if (keywords.length === 1) {
        queryBuilder.andWhere(
          '(LOWER(student.first_name) LIKE LOWER(:keyword) OR LOWER(student.last_name) LIKE LOWER(:keyword))',
          { keyword: `%${keywords[0]}%` }
        );
      } else {
        const nameConditions = keywords.map((_, index) =>
          `(LOWER(student.first_name) LIKE LOWER(:keyword${index}) OR LOWER(student.last_name) LIKE LOWER(:keyword${index}))`
        ).join(' OR ');

        const keywordParams: any = {};
        keywords.forEach((keyword, index) => {
          keywordParams[`keyword${index}`] = `%${keyword}%`;
        });

        queryBuilder.andWhere(`(${nameConditions})`, keywordParams);
      }
    }
  }

  private formatStudentsList(students: Student[]) {
    return students.map(student => {
      const primaryAddress = student.addresses && student.addresses.length > 0
        ? student.addresses[0]
        : null;

      const contactDetails = student.contact_details && student.contact_details.length > 0
        ? student.contact_details[0]
        : null;

      const eligibilityStatus = student.eligibility_status && student.eligibility_status.length > 0
        ? student.eligibility_status[0]
        : null;

      const completedCourses = student.facility_records && student.facility_records.length > 0
        ? student.facility_records.map(f => f.course_type).filter(Boolean).join(', ')
        : 'N/A';

      const checklistApproval = eligibilityStatus
        ? (eligibilityStatus.classes_completed === true &&
          eligibilityStatus.fees_paid === true &&
          eligibilityStatus.assignments_submitted === true &&
          eligibilityStatus.documents_submitted === true &&
          eligibilityStatus.trainer_consent === true) ||
        eligibilityStatus.override_requested === true ||
        eligibilityStatus.manual_handling === true
        : false;

      return {
        student_id: student.student_id,
        name: `${student.first_name} ${student.last_name}`,
        email: contactDetails?.email || 'N/A',
        primary_phone: contactDetails?.primary_mobile || 'N/A',
        student_type: student.student_type || 'N/A',
        course_completed: completedCourses,
        city: primaryAddress?.city || 'N/A',
        status: student.status,
        checklist_approval: checklistApproval,
        manual_handling: eligibilityStatus?.manual_handling || false,
        activation_status: student.isDeleted ? 'inactive' : 'active',
        created_on: student.createdAt
      };
    });
  }

  private applyPostQueryFilters(response: any[], params: IStudentQueryParams) {
    let filteredResponse = response;

    const parseFilterValues = (value: string | string[] | undefined): string[] | null => {
      if (!value) return null;
      if (Array.isArray(value)) return value;
      return value.split(',').map(v => v.trim()).filter(v => v);
    };

    const courseValues = parseFilterValues(params.course_completed);
    if (courseValues && courseValues.length > 0) {
      filteredResponse = filteredResponse.filter(student => {
        if (student.course_completed === 'N/A') return false;
        const studentCourses = student.course_completed.split(',').map(c => c.trim().toLowerCase());
        return courseValues.some(course =>
          studentCourses.some(sc => sc.includes(course.toLowerCase()))
        );
      });
    }

    if (params.checklist_approval === 'true') {
      filteredResponse = filteredResponse.filter(student => student.checklist_approval === true);
    } else if (params.checklist_approval === 'false') {
      filteredResponse = filteredResponse.filter(student => student.checklist_approval === false);
    }

    return filteredResponse;
  }
}

export default new StudentQueryService();
