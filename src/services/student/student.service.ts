import { getRepository, In } from 'typeorm';

// Entities
import { Student } from '../../entities/student/student.entity';
import { ContactDetails } from '../../entities/student/contact-details.entity';
import { User } from '../../entities/user/user.entity';

// Services
import RoleService from '../role/role.service';

// Utilities
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';
import TransactionUtility from '../../utilities/transaction.utility';

// Interfaces
import { IDeleteById, IDetailById } from '../../interfaces/common.interface';

// Errors
import { StringError } from '../../errors/string.error';

const baseWhere = { isDeleted: false };

// Create Student
const create = async (params: ICreateStudent) => {
  return await TransactionUtility.executeInTransaction(async (queryRunner) => {
    console.log('🚀 Starting student creation with transaction...');

    // Step 1: Create student record
    const student = new Student();
    student.first_name = params.first_name;
    student.last_name = params.last_name;
    student.dob = params.dob;
    student.gender = params.gender;
    student.nationality = params.nationality;
    student.student_type = params.student_type || 'domestic';
    student.status = params.status || 'active';

    const studentData = await queryRunner.manager.save(Student, student);
    console.log('✅ Student record created with ID:', studentData.student_id);

    // Step 2: If email is provided, create user account
    if (params.email) {
      try {
        console.log('🔧 Attempting to create user account for email:', params.email);

        if (!params.password) {
          throw new Error('Password is required for user account creation');
        }

        const hashedPassword = await PasswordUtility.hashPassword(params.password);
        const roleId = await RoleService.getRoleIdByName('student');

        const user = new User();
        user.loginID = params.email;
        user.password = hashedPassword;
        user.roleID = roleId;
        user.studentID = studentData.student_id;
        user.status = 'active';

        await queryRunner.manager.save(User, user);
        console.log('✅ User account created successfully');
        console.log('📋 Password encrypted and stored securely');
        console.log('🔗 Student ID linked to user account');

      } catch (userError) {
        console.error('❌ Failed to create user account:', userError.message);
        throw new Error(`Failed to create user account: ${userError.message}`);
      }
    }

    console.log('🎉 Student creation transaction committed successfully!');
    return ApiUtility.sanitizeStudent(studentData);
  });
};

// Student creation interface
export interface ICreateStudent {
  first_name: string;
  last_name: string;
  dob: Date;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status?: 'active' | 'inactive' | 'graduated' | 'withdrawn';
  email?: string; // Email for automatic user account creation
  password?: string; // Password for user account (will be hashed)
}

// Student update interface
export interface IUpdateStudent {
  student_id: number;
  first_name?: string;
  last_name?: string;
  dob?: Date;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status?: 'active' | 'inactive' | 'graduated' | 'withdrawn';
}

// Student query parameters interface
export interface IStudentQueryParams {
  keyword?: string;
  status?: string;
  student_type?: string;
  nationality?: string;
  min_age?: number;
  max_age?: number;
  created_from?: string;
  created_to?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}

// Student detail response interface
export interface IStudentDetail {
  student_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  dob: Date;
  age: number;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status: string;
  contact_details?: any[];
  visa_details?: any[];
  addresses?: any[];
  eligibility_status?: any[];
  student_lifestyle?: any[];
  placement_preferences?: any[];
  facility_records?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Student list response interface
export interface IStudentListResponse {
  response: IStudentDetail[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

// Student statistics interface
export interface IStudentStatistics {
  total_students: number;
  active_students: number;
  international_students: number;
  graduated_students: number;
  inactive_students: number;
  domestic_students: number;
}

// Bulk update interface
export interface IBulkUpdateStatus {
  student_ids: number[];
  status: string;
}

// Advanced search parameters
export interface IAdvancedSearchParams {
  name?: string;
  nationality?: string;
  student_type?: string;
  status?: string;
  min_age?: number;
  max_age?: number;
  has_visa?: boolean;
  limit?: number;
  page?: number;
}

// Contact details creation interface
export interface ICreateContactDetails {
  primary_mobile?: string;
  email?: string;
  emergency_contact?: string;
  contact_type?: 'mobile' | 'landline' | 'whatsapp';
  is_primary?: boolean;
  verified_at?: Date;
  student: { student_id: number };
}

// Visa details creation interface
export interface ICreateVisaDetails {
  visa_type?: string;
  visa_number?: string;
  start_date?: Date;
  expiry_date?: Date;
  status?: 'active' | 'expired' | 'revoked' | 'pending';
  issuing_country?: string;
  document_path?: string;
  student: { student_id: number };
}

// Address creation interface
export interface ICreateAddress {
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  address_type?: 'current' | 'permanent' | 'temporary' | 'mailing';
  is_primary?: boolean;
  student: { student_id: number };
}

// Eligibility status creation interface
export interface ICreateEligibilityStatus {
  classes_completed?: boolean;
  fees_paid?: boolean;
  assignments_submitted?: boolean;
  documents_submitted?: boolean;
  trainer_consent?: boolean;
  override_requested?: boolean;
  requested_by?: string;
  reason?: string;
  comments?: string;
  overall_status?: 'eligible' | 'not_eligible' | 'pending' | 'override';
  student: { student_id: number };
}

// Student lifestyle creation interface
export interface ICreateStudentLifestyle {
  currently_working?: boolean;
  working_hours?: string;
  has_dependents?: boolean;
  married?: boolean;
  driving_license?: boolean;
  own_vehicle?: boolean;
  public_transport_only?: boolean;
  can_travel_long_distance?: boolean;
  drop_support_available?: boolean;
  fully_flexible?: boolean;
  rush_placement_required?: boolean;
  preferred_days?: string;
  preferred_time_slots?: string;
  additional_notes?: string;
  student: { student_id: number };
}

// Placement preferences creation interface
export interface ICreatePlacementPreferences {
  preferred_states?: string;
  preferred_cities?: string;
  max_travel_distance_km?: number;
  morning_only?: boolean;
  evening_only?: boolean;
  night_shift?: boolean;
  weekend_only?: boolean;
  part_time?: boolean;
  full_time?: boolean;
  with_friend?: boolean;
  friend_name_or_id?: string;
  with_spouse?: boolean;
  spouse_name_or_id?: string;
  earliest_start_date?: Date;
  latest_start_date?: Date;
  specific_month_preference?: string;
  urgency_level?: 'immediate' | 'within_month' | 'within_quarter' | 'flexible';
  additional_preferences?: string;
  student: { student_id: number };
}

// Facility records creation interface
export interface ICreateFacilityRecords {
  facility_name?: string;
  facility_type?: string;
  branch_site?: string;
  facility_address?: string;
  contact_person_name?: string;
  contact_email?: string;
  contact_phone?: string;
  supervisor_name?: string;
  distance_from_student_km?: number;
  slot_id?: string;
  course_type?: string;
  shift_timing?: string;
  start_date?: Date;
  duration_hours?: number;
  gender_requirement?: string;
  applied_on?: Date;
  student_confirmed?: boolean;
  student_comments?: string;
  document_type?: string;
  file_path?: string;
  application_status?: 'applied' | 'under_review' | 'accepted' | 'rejected' | 'confirmed' | 'completed';
  student: { student_id: number };
}

// Address change request creation interface
export interface ICreateAddressChangeRequest {
  current_address?: string;
  new_address?: string;
  effective_date?: Date;
  change_reason?: string;
  impact_acknowledged?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'implemented';
  reviewed_at?: Date;
  reviewed_by?: string;
  review_comments?: string;
  student: { student_id: number };
}

// Job status update creation interface
export interface ICreateJobStatusUpdate {
  status: string;
  last_updated_on?: Date;
  employer_name?: string;
  job_role?: string;
  start_date?: Date;
  employment_type?: string;
  offer_letter_path?: string;
  actively_applying?: boolean;
  expected_timeline?: string;
  searching_comments?: string;
  created_at?: Date;
  student: { student_id: number };
}

// Get Student by ID
const getById = async (params: IDetailById) => {
  try {
    const data = await getRepository(Student).findOne({
      where: { student_id: params.id },
    });
    return ApiUtility.sanitizeStudent(data);
  } catch (e) {
    return null;
  }
};

// Get Student Detail (with validation)
const detail = async (params: IDetailById) => {
  const query = {
    where: { ...baseWhere, student_id: params.id },
  };

  const student = await getRepository(Student).findOne(query);
  if (!student) {
    throw new StringError('Student does not exist');
  }

  return ApiUtility.sanitizeStudent(student);
};

// Get all student details (comprehensive with relations and user account, excluding password)
const getAllDetails = async (params: IDetailById) => {
  try {
    // Get student with all relations
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

    const sanitizedStudent = ApiUtility.sanitizeStudent(student);

    // Get associated user account information
    let userDetails = null;
    if (student.contact_details && student.contact_details.length > 0) {
      const primaryEmail = student.contact_details.find(cd => cd.email)?.email;
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
};

// Update Student
const update = async (params: IUpdateStudent) => {
  const query = { ...baseWhere, student_id: params.student_id };

  const student = await getRepository(Student).findOne(query);
  if (!student) {
    throw new StringError('Student does not exist');
  }

  const updateData: Partial<Student> = {
    first_name: params.first_name,
    last_name: params.last_name,
    dob: params.dob,
    gender: params.gender,
    nationality: params.nationality,
    student_type: params.student_type,
    status: params.status,
    updatedAt: new Date(),
  };

  await getRepository(Student).update(query, updateData);
  return await detail({ id: params.student_id });
};

// List Students with pagination and filtering
const list = async (params: IStudentQueryParams) => {
  let studentRepo = getRepository(Student).createQueryBuilder('student');
  studentRepo = studentRepo.where('student.isDeleted = :isDeleted', { isDeleted: false });

  // Text search
  if (params.keyword) {
    studentRepo = studentRepo.andWhere(
      '(LOWER(student.first_name) LIKE LOWER(:keyword) OR LOWER(student.last_name) LIKE LOWER(:keyword) OR student.student_id LIKE :keyword)',
      { keyword: `%${params.keyword}%` },
    );
  }

  // Filter by status
  if (params.status) {
    studentRepo = studentRepo.andWhere('student.status = :status', { status: params.status });
  }

  // Filter by student type
  if (params.student_type) {
    studentRepo = studentRepo.andWhere('student.student_type = :student_type', {
      student_type: params.student_type
    });
  }

  // Filter by nationality
  if (params.nationality) {
    studentRepo = studentRepo.andWhere('student.nationality = :nationality', {
      nationality: params.nationality
    });
  }

  // Sort options
  const sortBy = params.sort_by || 'student_id';
  const sortOrder = params.sort_order === 'asc' ? 'ASC' : 'DESC';
  studentRepo = studentRepo.orderBy(sortBy, sortOrder);

  // Pagination
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
};

// Delete Student (soft delete)
const remove = async (params: IDeleteById) => {
  const query = { ...baseWhere, student_id: params.id };

  const student = await getRepository(Student).findOne(query);
  if (!student) {
    throw new StringError('Student does not exist');
  }

  return await getRepository(Student).update(query, {
    isDeleted: true,
    updatedAt: new Date(),
  });
};

// Permanently delete student and all related data
const permanentlyDelete = async (params: IDeleteById) => {
  const query = { student_id: params.id };

  const student = await getRepository(Student).findOne(query);
  if (!student) {
    throw new StringError('Student does not exist');
  }

  await getRepository(Student).delete(query);
  return { success: true };
};

// Bulk update student status
const bulkUpdateStatus = async (student_ids: number[], status: 'active' | 'inactive' | 'graduated' | 'withdrawn') => {
  await getRepository(Student).update(
    { student_id: In(student_ids) },
    { status, updatedAt: new Date() }
  );
  return { success: true };
};

// Advanced search for students
const advancedSearch = async (params: IAdvancedSearchParams) => {
  let studentRepo = getRepository(Student).createQueryBuilder('student');
  studentRepo = studentRepo.where('student.isDeleted = :isDeleted', { isDeleted: false });

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
      studentRepo = studentRepo.andWhere('visa.vis-id IS NULL');
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
};

// Get student statistics
const getStatistics = async () => {
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
};

// Get student with user account details
const getWithUserDetails = async (studentId: number) => {
  const student = await getById({ id: studentId });
  if (!student) {
    throw new StringError('Student not found');
  }

  let userDetails = null;
  if (student.contact_details && student.contact_details.length > 0) {
    const primaryEmail = student.contact_details.find(cd => cd.email)?.email;
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
};

export default {
  create,
  getById,
  detail,
  update,
  list,
  remove,
  permanentlyDelete,
  bulkUpdateStatus,
  getStatistics,
  advancedSearch,
  getAllDetails,
  getWithUserDetails
};