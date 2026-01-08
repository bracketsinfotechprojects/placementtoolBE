import { getRepository, In } from 'typeorm';

// Entities
import { Student } from '../../entities/student/student.entity';
import { ContactDetails } from '../../entities/student/contact-details.entity';
import { VisaDetails } from '../../entities/student/visa-details.entity';
import { Address } from '../../entities/student/address.entity';
import { EligibilityStatus } from '../../entities/student/eligibility-status.entity';
import { StudentLifestyle } from '../../entities/student/student-lifestyle.entity';
import { PlacementPreferences } from '../../entities/student/placement-preferences.entity';
import { FacilityRecords } from '../../entities/student/facility-records.entity';
import { AddressChangeRequest } from '../../entities/student/address-change-request.entity';
import { JobStatusUpdate } from '../../entities/student/job-status-update.entity';
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

// Create Student with all related entities
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

    // Step 2: Create contact details if provided
    if (params.contact_details) {
      try {
        console.log('📞 Creating contact details...');
        const contactDetails = new ContactDetails();
        contactDetails.student = studentData;
        contactDetails.primary_mobile = params.contact_details.primary_mobile;
        contactDetails.email = params.contact_details.email || params.email;
        contactDetails.emergency_contact = params.contact_details.emergency_contact;
        contactDetails.contact_type = params.contact_details.contact_type || 'mobile';
        contactDetails.is_primary = params.contact_details.is_primary !== undefined ? params.contact_details.is_primary : true;
        contactDetails.verified_at = params.contact_details.verified_at;

        await queryRunner.manager.save(ContactDetails, contactDetails);
        console.log('✅ Contact details created');
      } catch (error) {
        console.error('❌ Failed to create contact details:', error.message);
        throw new Error(`Failed to create contact details: ${error.message}`);
      }
    }

    // Step 3: Create visa details if provided
    if (params.visa_details) {
      try {
        console.log('🛂 Creating visa details...');
        const visaDetails = new VisaDetails();
        visaDetails.student = studentData;
        visaDetails.visa_type = params.visa_details.visa_type;
        visaDetails.visa_number = params.visa_details.visa_number;
        visaDetails.start_date = params.visa_details.start_date;
        visaDetails.expiry_date = params.visa_details.expiry_date;
        visaDetails.status = params.visa_details.status || 'active';
        visaDetails.issuing_country = params.visa_details.issuing_country;
        visaDetails.document_path = params.visa_details.document_path;

        await queryRunner.manager.save(VisaDetails, visaDetails);
        console.log('✅ Visa details created');
      } catch (error) {
        console.error('❌ Failed to create visa details:', error.message);
        throw new Error(`Failed to create visa details: ${error.message}`);
      }
    }

    // Step 4: Create addresses if provided
    if (params.addresses && params.addresses.length > 0) {
      try {
        console.log('🏠 Creating addresses...');
        for (const addressData of params.addresses) {
          const address = new Address();
          address.student = studentData;
          address.line1 = addressData.line1;
          address.city = addressData.city;
          address.state = addressData.state;
          address.country = addressData.country;
          address.postal_code = addressData.postal_code;
          address.address_type = addressData.address_type || 'current';
          address.is_primary = addressData.is_primary || false;

          await queryRunner.manager.save(Address, address);
        }
        console.log(`✅ ${params.addresses.length} address(es) created`);
      } catch (error) {
        console.error('❌ Failed to create addresses:', error.message);
        throw new Error(`Failed to create addresses: ${error.message}`);
      }
    }

    // Step 5: Create eligibility status if provided
    if (params.eligibility_status) {
      try {
        console.log('📋 Creating eligibility status...');
        const eligibilityStatus = new EligibilityStatus();
        eligibilityStatus.student = studentData;
        eligibilityStatus.classes_completed = params.eligibility_status.classes_completed;
        eligibilityStatus.fees_paid = params.eligibility_status.fees_paid;
        eligibilityStatus.assignments_submitted = params.eligibility_status.assignments_submitted;
        eligibilityStatus.documents_submitted = params.eligibility_status.documents_submitted;
        eligibilityStatus.trainer_consent = params.eligibility_status.trainer_consent;
        eligibilityStatus.override_requested = params.eligibility_status.override_requested;
        eligibilityStatus.requested_by = params.eligibility_status.requested_by;
        eligibilityStatus.reason = params.eligibility_status.reason;
        eligibilityStatus.comments = params.eligibility_status.comments;
        eligibilityStatus.overall_status = params.eligibility_status.overall_status || 'not_eligible';

        await queryRunner.manager.save(EligibilityStatus, eligibilityStatus);
        console.log('✅ Eligibility status created');
      } catch (error) {
        console.error('❌ Failed to create eligibility status:', error.message);
        throw new Error(`Failed to create eligibility status: ${error.message}`);
      }
    }

    // Step 6: Create student lifestyle if provided
    if (params.student_lifestyle) {
      try {
        console.log('🌟 Creating student lifestyle...');
        const lifestyle = new StudentLifestyle();
        lifestyle.student = studentData;
        lifestyle.currently_working = params.student_lifestyle.currently_working;
        lifestyle.working_hours = params.student_lifestyle.working_hours;
        lifestyle.has_dependents = params.student_lifestyle.has_dependents;
        lifestyle.married = params.student_lifestyle.married;
        lifestyle.driving_license = params.student_lifestyle.driving_license;
        lifestyle.own_vehicle = params.student_lifestyle.own_vehicle;
        lifestyle.public_transport_only = params.student_lifestyle.public_transport_only;
        lifestyle.can_travel_long_distance = params.student_lifestyle.can_travel_long_distance;
        lifestyle.drop_support_available = params.student_lifestyle.drop_support_available;
        lifestyle.fully_flexible = params.student_lifestyle.fully_flexible;
        lifestyle.rush_placement_required = params.student_lifestyle.rush_placement_required;
        lifestyle.preferred_days = params.student_lifestyle.preferred_days;
        lifestyle.preferred_time_slots = params.student_lifestyle.preferred_time_slots;
        lifestyle.additional_notes = params.student_lifestyle.additional_notes;

        await queryRunner.manager.save(StudentLifestyle, lifestyle);
        console.log('✅ Student lifestyle created');
      } catch (error) {
        console.error('❌ Failed to create student lifestyle:', error.message);
        throw new Error(`Failed to create student lifestyle: ${error.message}`);
      }
    }

    // Step 7: Create placement preferences if provided
    if (params.placement_preferences) {
      try {
        console.log('🎯 Creating placement preferences...');
        const preferences = new PlacementPreferences();
        preferences.student = studentData;
        preferences.preferred_states = params.placement_preferences.preferred_states;
        preferences.preferred_cities = params.placement_preferences.preferred_cities;
        preferences.max_travel_distance_km = params.placement_preferences.max_travel_distance_km;
        preferences.morning_only = params.placement_preferences.morning_only;
        preferences.evening_only = params.placement_preferences.evening_only;
        preferences.night_shift = params.placement_preferences.night_shift;
        preferences.weekend_only = params.placement_preferences.weekend_only;
        preferences.part_time = params.placement_preferences.part_time;
        preferences.full_time = params.placement_preferences.full_time;
        preferences.with_friend = params.placement_preferences.with_friend;
        preferences.friend_name_or_id = params.placement_preferences.friend_name_or_id;
        preferences.with_spouse = params.placement_preferences.with_spouse;
        preferences.spouse_name_or_id = params.placement_preferences.spouse_name_or_id;
        preferences.earliest_start_date = params.placement_preferences.earliest_start_date;
        preferences.latest_start_date = params.placement_preferences.latest_start_date;
        preferences.specific_month_preference = params.placement_preferences.specific_month_preference;
        preferences.urgency_level = params.placement_preferences.urgency_level || 'flexible';
        preferences.additional_preferences = params.placement_preferences.additional_preferences;

        await queryRunner.manager.save(PlacementPreferences, preferences);
        console.log('✅ Placement preferences created');
      } catch (error) {
        console.error('❌ Failed to create placement preferences:', error.message);
        throw new Error(`Failed to create placement preferences: ${error.message}`);
      }
    }

    // Step 8: Create facility records if provided
    if (params.facility_records && params.facility_records.length > 0) {
      try {
        console.log('🏥 Creating facility records...');
        for (const facilityData of params.facility_records) {
          const facility = new FacilityRecords();
          facility.student = studentData;
          facility.facility_name = facilityData.facility_name;
          facility.facility_type = facilityData.facility_type;
          facility.branch_site = facilityData.branch_site;
          facility.facility_address = facilityData.facility_address;
          facility.contact_person_name = facilityData.contact_person_name;
          facility.contact_email = facilityData.contact_email;
          facility.contact_phone = facilityData.contact_phone;
          facility.supervisor_name = facilityData.supervisor_name;
          facility.distance_from_student_km = facilityData.distance_from_student_km;
          facility.slot_id = facilityData.slot_id;
          facility.course_type = facilityData.course_type;
          facility.shift_timing = facilityData.shift_timing;
          facility.start_date = facilityData.start_date;
          facility.duration_hours = facilityData.duration_hours;
          facility.gender_requirement = facilityData.gender_requirement;
          facility.applied_on = facilityData.applied_on;
          facility.student_confirmed = facilityData.student_confirmed;
          facility.student_comments = facilityData.student_comments;
          facility.document_type = facilityData.document_type;
          facility.file_path = facilityData.file_path;
          facility.application_status = facilityData.application_status || 'applied';

          await queryRunner.manager.save(FacilityRecords, facility);
        }
        console.log(`✅ ${params.facility_records.length} facility record(s) created`);
      } catch (error) {
        console.error('❌ Failed to create facility records:', error.message);
        throw new Error(`Failed to create facility records: ${error.message}`);
      }
    }

    // Step 9: Create address change requests if provided
    if (params.address_change_requests && params.address_change_requests.length > 0) {
      try {
        console.log('📝 Creating address change requests...');
        for (const requestData of params.address_change_requests) {
          const request = new AddressChangeRequest();
          request.student = studentData;
          request.current_address = requestData.current_address;
          request.new_address = requestData.new_address;
          request.effective_date = requestData.effective_date;
          request.change_reason = requestData.change_reason;
          request.impact_acknowledged = requestData.impact_acknowledged;
          request.status = requestData.status || 'pending';
          request.reviewed_at = requestData.reviewed_at;
          request.reviewed_by = requestData.reviewed_by;
          request.review_comments = requestData.review_comments;

          await queryRunner.manager.save(AddressChangeRequest, request);
        }
        console.log(`✅ ${params.address_change_requests.length} address change request(s) created`);
      } catch (error) {
        console.error('❌ Failed to create address change requests:', error.message);
        throw new Error(`Failed to create address change requests: ${error.message}`);
      }
    }

    // Step 10: Create job status updates if provided
    if (params.job_status_updates && params.job_status_updates.length > 0) {
      try {
        console.log('💼 Creating job status updates...');
        for (const jobData of params.job_status_updates) {
          const jobStatus = new JobStatusUpdate();
          jobStatus.student = studentData;
          jobStatus.status = jobData.status;
          jobStatus.last_updated_on = jobData.last_updated_on;
          jobStatus.employer_name = jobData.employer_name;
          jobStatus.job_role = jobData.job_role;
          jobStatus.start_date = jobData.start_date;
          jobStatus.employment_type = jobData.employment_type;
          jobStatus.offer_letter_path = jobData.offer_letter_path;
          jobStatus.actively_applying = jobData.actively_applying;
          jobStatus.expected_timeline = jobData.expected_timeline;
          jobStatus.searching_comments = jobData.searching_comments;
          jobStatus.created_at = jobData.created_at;

          await queryRunner.manager.save(JobStatusUpdate, jobStatus);
        }
        console.log(`✅ ${params.job_status_updates.length} job status update(s) created`);
      } catch (error) {
        console.error('❌ Failed to create job status updates:', error.message);
        throw new Error(`Failed to create job status updates: ${error.message}`);
      }
    }

    // Step 11: Create user account if email is provided
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
    console.log('📊 Summary: Student and all related entities created');
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
  
  // Related entities (optional)
  contact_details?: ICreateContactDetails;
  visa_details?: ICreateVisaDetails;
  addresses?: ICreateAddress[];
  eligibility_status?: ICreateEligibilityStatus;
  student_lifestyle?: ICreateStudentLifestyle;
  placement_preferences?: ICreatePlacementPreferences;
  facility_records?: ICreateFacilityRecords[];
  address_change_requests?: ICreateAddressChangeRequest[];
  job_status_updates?: ICreateJobStatusUpdate[];
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