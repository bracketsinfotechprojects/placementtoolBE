import { getRepository, SelectQueryBuilder } from 'typeorm';
import { Student } from '../entities/student/student.entity';
import ApiUtility from '../utilities/api.utility';

/**
 * Student Repository
 * Encapsulates all database query logic for Student entity
 * Follows Repository Pattern to separate data access from business logic
 */
export default class StudentRepository {
  /**
   * Get base query builder with common conditions
   */
  private static getBaseQuery(): SelectQueryBuilder<Student> {
    return getRepository(Student)
      .createQueryBuilder('student')
      .where('student.isDeleted = :isDeleted', { isDeleted: false });
  }

  /**
   * Find student by ID
   */
  static async findById(id: number): Promise<Student | undefined> {
    return await getRepository(Student).findOne({
      where: { student_id: id, isDeleted: false }
    });
  }

  /**
   * Find student by ID with all relations
   */
  static async findByIdWithRelations(id: number): Promise<Student | undefined> {
    return await getRepository(Student).findOne({
      where: { student_id: id, isDeleted: false },
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
  }

  /**
   * Build query with filters
   */
  static buildFilteredQuery(params: IStudentFilters): SelectQueryBuilder<Student> {
    let query = this.getBaseQuery();

    // Text search
    if (params.keyword) {
      query = query.andWhere(
        '(LOWER(student.first_name) LIKE LOWER(:keyword) OR LOWER(student.last_name) LIKE LOWER(:keyword) OR student.student_id LIKE :keyword)',
        { keyword: `%${params.keyword}%` }
      );
    }

    // Status filter
    if (params.status) {
      query = query.andWhere('student.status = :status', { status: params.status });
    }

    // Student type filter
    if (params.student_type) {
      query = query.andWhere('student.student_type = :student_type', { 
        student_type: params.student_type 
      });
    }

    // Nationality filter
    if (params.nationality) {
      query = query.andWhere('student.nationality = :nationality', { 
        nationality: params.nationality 
      });
    }

    // Age filters
    if (params.min_age) {
      const minDob = new Date();
      minDob.setFullYear(minDob.getFullYear() - params.min_age);
      query = query.andWhere('student.dob <= :minDob', { minDob });
    }

    if (params.max_age) {
      const maxDob = new Date();
      maxDob.setFullYear(maxDob.getFullYear() - params.max_age);
      query = query.andWhere('student.dob >= :maxDob', { maxDob });
    }

    // Visa filter
    if (params.has_visa !== undefined) {
      if (params.has_visa) {
        query = query.innerJoinAndSelect('student.visa_details', 'visa');
      } else {
        query = query.leftJoinAndSelect('student.visa_details', 'visa');
        query = query.andWhere('visa.visa_id IS NULL');
      }
    }

    return query;
  }

  /**
   * Apply sorting to query
   */
  static applySorting(
    query: SelectQueryBuilder<Student>,
    sortBy: string = 'student_id',
    sortOrder: string = 'DESC'
  ): SelectQueryBuilder<Student> {
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    return query.orderBy(`student.${sortBy}`, order);
  }

  /**
   * Apply pagination to query
   */
  static applyPagination(
    query: SelectQueryBuilder<Student>,
    limit: number = 20,
    page: number = 1
  ): SelectQueryBuilder<Student> {
    const offset = ApiUtility.getOffset(limit, page);
    return query.limit(limit).offset(offset);
  }

  /**
   * Get paginated and filtered students
   */
  static async findWithFilters(params: IStudentQueryParams): Promise<{
    students: Student[];
    total: number;
  }> {
    let query = this.buildFilteredQuery(params);
    
    // Get total count before pagination
    const total = await query.getCount();

    // Apply sorting and pagination
    query = this.applySorting(query, params.sort_by, params.sort_order);
    query = this.applyPagination(query, params.limit, params.page);

    const students = await query.getMany();

    return { students, total };
  }

  /**
   * Get student statistics
   */
  static async getStatistics(): Promise<IStudentStatistics> {
    const repo = getRepository(Student);
    const baseWhere = { isDeleted: false };

    const [
      totalStudents,
      activeStudents,
      internationalStudents,
      graduatedStudents,
      inactiveStudents
    ] = await Promise.all([
      repo.count({ where: baseWhere }),
      repo.count({ where: { ...baseWhere, status: 'active' } }),
      repo.count({ where: { ...baseWhere, student_type: 'international' } }),
      repo.count({ where: { ...baseWhere, status: 'graduated' } }),
      repo.count({ where: { ...baseWhere, status: 'inactive' } })
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
   * Soft delete student
   */
  static async softDelete(id: number): Promise<void> {
    await getRepository(Student).update(
      { student_id: id, isDeleted: false },
      { isDeleted: true, updatedAt: new Date() }
    );
  }

  /**
   * Permanently delete student
   */
  static async permanentlyDelete(id: number): Promise<void> {
    await getRepository(Student).delete({ student_id: id });
  }

  /**
   * Bulk update status
   */
  static async bulkUpdateStatus(
    studentIds: number[],
    status: string
  ): Promise<void> {
    await getRepository(Student).update(
      { student_id: In(studentIds) },
      { status: status as any, updatedAt: new Date() }
    );
  }
}

// Interfaces
export interface IStudentFilters {
  keyword?: string;
  status?: string;
  student_type?: string;
  nationality?: string;
  min_age?: number;
  max_age?: number;
  has_visa?: boolean;
}

export interface IStudentQueryParams extends IStudentFilters {
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}

export interface IStudentStatistics {
  total_students: number;
  active_students: number;
  international_students: number;
  graduated_students: number;
  inactive_students: number;
  domestic_students: number;
}

// Fix missing import
import { In } from 'typeorm';
