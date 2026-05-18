import { getRepository, In, getConnection } from 'typeorm';

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
import { SelfPlacement } from '../../entities/student/self-placement.entity';
import { User } from '../../entities/user/user.entity';
// Additional entities needed for getStudentFacilities
import { PlacementAssignment } from '../../entities/placement-assignment/placement-assignment.entity';
import { Facility } from '../../entities/facility/facility.entity';

// Services
import RoleService from '../role/role.service';

// Repositories
import PlacementAssignmentRepository from '../../repositories/placement-assignment.repository';

// Utilities
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';
import TransactionUtility from '../../utilities/transaction.utility';
import ExcelUtility from '../../utilities/excel.utility';

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

    // Handle location with ST_MakePoint if latitude and longitude provided
    let studentData;
    console.log('🔍 Location params:', { latitude: params.latitude, longitude: params.longitude });
    
    if (params.latitude !== undefined && params.longitude !== undefined) {
      console.log('✅ Both coordinates provided, setting actual location');
      // Save student first without location
      const tempStudent = await queryRunner.manager.save(Student, student);
      const studentId = tempStudent.student_id;

      // Update with POINT for location (MySQL format: POINT(longitude, latitude))
      await queryRunner.manager.query(
        `UPDATE students SET location = POINT(?, ?) WHERE student_id = ?`,
        [params.longitude, params.latitude, studentId]
      );
      console.log(`📍 Location set to POINT(${params.longitude}, ${params.latitude})`);

      // Fetch the updated student
      studentData = await queryRunner.manager.findOne(Student, { where: { student_id: studentId } });
    } else {
      console.log('⚠️ Coordinates not provided or incomplete, using default POINT(0, 0)');
      // Save student with default location POINT(0, 0)
      const tempStudent = await queryRunner.manager.save(Student, student);
      const studentId = tempStudent.student_id;

      // Set default location
      await queryRunner.manager.query(
        `UPDATE students SET location = POINT(0, 0) WHERE student_id = ?`,
        [studentId]
      );
      console.log('📍 Location set to default POINT(0, 0)');

      studentData = await queryRunner.manager.findOne(Student, { where: { student_id: studentId } });
    }

    console.log('✅ Student record created with ID:', studentData.student_id);

    // Step 2: Create contact details if provided
    if (params.contact_details) {
      try {
        console.log('📞 Creating contact details...');
        const contactDetails = new ContactDetails();
        contactDetails.student = studentData;
        contactDetails.primary_mobile = params.contact_details.primary_mobile;
        contactDetails.email = params.contact_details.email || params.email;
        contactDetails.alternate_contact = params.contact_details.alternate_contact;
        contactDetails.emergency_contact = params.contact_details.emergency_contact;
        contactDetails.emergency_contact_name = params.contact_details.emergency_contact_name;
        contactDetails.relationship = params.contact_details.relationship;
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
        visaDetails.work_limitation = params.visa_details.work_limitation;

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
          address.line2 = addressData.line2;
          address.suburb = addressData.suburb;
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

        // Validate and sanitize overall_status
        const validStatuses = ['eligible', 'not_eligible', 'pending', 'override'];
        let overallStatus = params.eligibility_status.overall_status?.trim() || 'not_eligible';

        if (!validStatuses.includes(overallStatus)) {
          console.warn(`⚠️ Invalid overall_status received: "${overallStatus}". Using default: "not_eligible"`);
          overallStatus = 'not_eligible';
        }

        console.log(`📊 Overall status value: "${overallStatus}" (type: ${typeof overallStatus})`);

        const eligibilityStatus = new EligibilityStatus();
        eligibilityStatus.student = studentData;
        eligibilityStatus.classes_completed = params.eligibility_status.classes_completed;
        eligibilityStatus.fees_paid = params.eligibility_status.fees_paid;
        eligibilityStatus.assignments_submitted = params.eligibility_status.assignments_submitted;
        eligibilityStatus.documents_submitted = params.eligibility_status.documents_submitted;
        eligibilityStatus.trainer_consent = params.eligibility_status.trainer_consent;
        eligibilityStatus.override_requested = params.eligibility_status.override_requested;
        eligibilityStatus.manual_override = params.eligibility_status.manual_override || false;
        eligibilityStatus.manual_handling = params.eligibility_status.manual_handling || false;
        eligibilityStatus.requested_by = params.eligibility_status.requested_by;
        eligibilityStatus.reason = params.eligibility_status.reason;
        eligibilityStatus.comments = params.eligibility_status.comments;
        eligibilityStatus.overall_status = overallStatus as 'eligible' | 'not_eligible' | 'pending' | 'override';

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

        // Validate and set urgency_level
        const validUrgencyLevels = ['immediate', 'within_month', 'within_quarter', 'flexible'];
        const urgencyLevel = params.placement_preferences.urgency_level?.toLowerCase().trim();
        if (urgencyLevel && !validUrgencyLevels.includes(urgencyLevel)) {
          throw new Error(`Invalid urgency_level: "${params.placement_preferences.urgency_level}". Must be one of: ${validUrgencyLevels.join(', ')}`);
        }
        preferences.urgency_level = (urgencyLevel as any) || 'flexible';

        preferences.additional_preferences = params.placement_preferences.additional_preferences;

        await queryRunner.manager.save(PlacementPreferences, preferences);
        console.log('✅ Placement preferences created');
      } catch (error) {
        console.error('❌ Failed to create placement preferences:', error.message);
        throw new Error(`Failed to create placement preferences: ${error.message}`);
      }
    }

    // Step 8: Create user account if email and password provided
    // Support both direct email/password and login object format
    const email = params.email || params.login?.email;
    const password = params.password || params.login?.password;
    const userStatus = params.login?.status || 'active'; // Get status from login object, default to 'active'
    
    if (email && password) {
      try {
        console.log('🔧 Creating user account...');

        const hashedPassword = await PasswordUtility.hashPassword(password);
        const roleId = await RoleService.getRoleIdByName('Student');

        const user = new User();
        user.loginID = email;
        user.password = hashedPassword;
        user.roleID = roleId;
        user.studentID = studentData.student_id;
        user.facilityID = null;
        user.supervisorID = null;
        user.placementExecutiveID = null;
        user.trainerID = null;
        user.status = userStatus; // Use status from login payload or default to 'active'

        await queryRunner.manager.save(User, user);
        console.log('✅ User account created successfully');
        console.log('📋 Password encrypted and stored securely');
        console.log('🔗 Student ID linked to user account');

      } catch (userError) {
        console.error('❌ Failed to create user account:', userError.message);
        throw new Error(`Failed to create user account: ${userError.message}`);
      }
    } else if (email) {
      console.log('ℹ️ Email provided but no password - user account NOT created');
    }

    console.log('🎉 Student creation transaction committed successfully!');
    console.log('📊 Summary: Student and all related entities created');
    console.log(`✅ STUDENT ID: ${studentData.student_id}`);
    console.log(`✅ DATABASE: ${process.env.DB_NAME || 'testcrm'}`);
    console.log(`✅ Check with: SELECT * FROM students WHERE student_id = ${studentData.student_id};`);
    return ApiUtility.sanitizeStudent(studentData);
  });
};

// Create External Student (no user account created)
// Only includes: students, contact_details, visa_details, addresses tables
const createExternalStudent = async (params: ICreateExternalStudent) => {
  return await TransactionUtility.executeInTransaction(async (queryRunner) => {
    console.log('🚀 Starting EXTERNAL student creation with transaction...');
    console.log('ℹ️ NOTE: No user account will be created for external students');

    // Step 1: Create student record
    const student = new Student();
    student.first_name = params.first_name;
    student.last_name = params.last_name;
    student.dob = params.dob;
    student.gender = params.gender;
    student.nationality = params.nationality;
    student.student_type = params.student_type || 'external';
    student.status = params.status || 'active';

    // Handle location with ST_MakePoint if latitude and longitude provided
    let studentData;
    if (params.latitude !== undefined && params.longitude !== undefined) {
      // Save student first without location
      const tempStudent = await queryRunner.manager.save(Student, student);
      const studentId = tempStudent.student_id;

      // Update with POINT for location (MySQL format: POINT(longitude, latitude))
      await queryRunner.manager.query(
        `UPDATE students SET location = POINT(?, ?) WHERE student_id = ?`,
        [params.longitude, params.latitude, studentId]
      );

      // Fetch the updated student
      studentData = await queryRunner.manager.findOne(Student, { where: { student_id: studentId } });
    } else {
      // Save student with default location POINT(0, 0)
      const tempStudent = await queryRunner.manager.save(Student, student);
      const studentId = tempStudent.student_id;

      // Set default location
      await queryRunner.manager.query(
        `UPDATE students SET location = POINT(0, 0) WHERE student_id = ?`,
        [studentId]
      );

      studentData = await queryRunner.manager.findOne(Student, { where: { student_id: studentId } });
    }

    console.log('✅ External Student record created with ID:', studentData.student_id);

    // Step 2: Create contact details if provided
    if (params.contact_details) {
      try {
        console.log('📞 Creating contact details...');
        const contactDetails = new ContactDetails();
        contactDetails.student = studentData;
        contactDetails.primary_mobile = params.contact_details.primary_mobile;
        contactDetails.email = params.contact_details.email;
        contactDetails.alternate_contact = params.contact_details.alternate_contact;
        contactDetails.emergency_contact = params.contact_details.emergency_contact;
        contactDetails.emergency_contact_name = params.contact_details.emergency_contact_name;
        contactDetails.relationship = params.contact_details.relationship;
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
        visaDetails.work_limitation = params.visa_details.work_limitation;

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
          address.line2 = addressData.line2;
          address.suburb = addressData.suburb;
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

    // NO USER ACCOUNT CREATED - This is the key difference for external students!
    console.log('🚫 Skipping user account creation (external student)');
    
    console.log('🎉 External Student creation transaction committed successfully!');
    console.log('📊 Summary: External Student created with contact, visa, and addresses only');
    console.log(`✅ STUDENT ID: ${studentData.student_id}`);
    console.log(`✅ DATABASE: ${process.env.DB_NAME || 'testcrm'}`);
    console.log(`✅ Check with: SELECT * FROM students WHERE student_id = ${studentData.student_id};`);
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
  status?: 'active' | 'inactive' | 'internship_completed' | 'eligible_for_certification' | 'placement_initiated' | 'self_placement_verification_pending' | 'self_placement_approved' | 'certified' | 'completed' | 'graduated' | 'withdrawn';
  latitude?: number;
  longitude?: number;
  email?: string; // Email for contact details and user account
  password?: string; // Password for user account (optional)
  login?: { // Alternative format for email/password
    email: string;
    password: string;
    status?: 'active' | 'inactive'; // User account status (optional)
  };

  // Related entities (optional)
  contact_details?: ICreateContactDetails;
  visa_details?: ICreateVisaDetails;
  addresses?: ICreateAddress[];
  eligibility_status?: ICreateEligibilityStatus;
  student_lifestyle?: ICreateStudentLifestyle;
  placement_preferences?: ICreatePlacementPreferences;

  // NOTE: facility_records, address_change_requests, and job_status_updates
  // are now managed via separate APIs after student creation
}

// External Student creation interface (no user account, limited tables)
export interface ICreateExternalStudent {
  first_name: string;
  last_name: string;
  dob: Date;
  gender?: string;
  nationality?: string;
  student_type?: string;  // Defaults to 'external'
  status?: 'active' | 'inactive' | 'internship_completed' | 'eligible_for_certification' | 'placement_initiated' | 'self_placement_verification_pending' | 'self_placement_approved' | 'certified' | 'completed' | 'graduated' | 'withdrawn';
  latitude?: number;
  longitude?: number;

  // Only these 3 related entities for external students
  contact_details?: ICreateContactDetails;
  visa_details?: ICreateVisaDetails;
  addresses?: ICreateAddress[];

  // NOTE: NO email/password - no user account created for external students
  // NOTE: NO eligibility_status, student_lifestyle, placement_preferences for external students
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
  status?: 'active' | 'inactive' | 'internship_completed' | 'eligible_for_certification' | 'placement_initiated' | 'self_placement_verification_pending' | 'self_placement_approved' | 'certified' | 'completed' | 'graduated' | 'withdrawn';
  latitude?: number;
  longitude?: number;

  // Related entities (optional) - same as create
  contact_details?: ICreateContactDetails;
  visa_details?: ICreateVisaDetails;
  addresses?: ICreateAddress[];
  eligibility_status?: ICreateEligibilityStatus;
  student_lifestyle?: ICreateStudentLifestyle;
  placement_preferences?: ICreatePlacementPreferences;
}

// Student query parameters interface
export interface IStudentQueryParams {
  keyword?: string;
  status?: string | string[]; // Support single or multiple values
  student_type?: string | string[]; // Support single or multiple values
  nationality?: string;
  min_age?: number;
  max_age?: number;
  created_from?: string;
  created_to?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
  activation_status?: 'active' | 'inactive' | 'all'; // active: isDeleted=0 & status!='inactive' | inactive: isDeleted=1 OR status='inactive' | all: show all
  city?: string | string[]; // Support single or multiple cities
  course_completed?: string | string[]; // Support single or multiple courses
  checklist_approval?: 'true' | 'false' | 'all'; // Filter by eligibility approval
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
  activation_status?: 'active' | 'inactive' | 'all'; // active: isDeleted=0 & status!='inactive' | inactive: isDeleted=1 OR status='inactive' | all: show all
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
  alternate_contact?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  relationship?: string;
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
  work_limitation?: string;
}

// Address creation interface
export interface ICreateAddress {
  line1?: string;
  line2?: string;
  suburb?: string;
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
  manual_override?: boolean;
  manual_handling?: boolean;
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
  
  // New detailed address fields - if provided, will update addresses table
  line1?: string;
  line2?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  address_type?: 'current' | 'permanent' | 'temporary' | 'mailing';
  is_primary?: boolean;
  
  // Nested change_request object (alternative structure)
  change_request?: {
    current_address?: string;
    new_address?: string;
    effective_date?: Date;
    change_reason?: string;
    impact_acknowledged?: boolean;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented';
    reviewed_at?: Date;
    reviewed_by?: string;
    review_comments?: string;
  };
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
    
    if (!data) return null;
    
    // Extract latitude and longitude from location POINT
    const locationData: any[] = await getConnection().query(
      `SELECT ST_X(location) as longitude, ST_Y(location) as latitude FROM students WHERE student_id = ?`,
      [params.id]
    );
    
    const sanitized: any = ApiUtility.sanitizeStudent(data);
    
    // Add lat/long to response
    if (locationData && locationData[0]) {
      sanitized.latitude = locationData[0].latitude;
      sanitized.longitude = locationData[0].longitude;
    }
    
    return sanitized;
  } catch (e) {
    return null;
  }
};

// Add Facility Record (Self Placement)
const addFacilityRecord = async (studentId: number, facilityData: ICreateFacilityRecords) => {
  return await TransactionUtility.executeInTransaction(async (queryRunner) => {
    console.log('🏥 Adding facility record for student:', studentId);

    // Verify student exists
    const student = await queryRunner.manager.findOne(Student, {
      where: { student_id: studentId, isDeleted: false }
    });

    if (!student) {
      throw new StringError('Student not found');
    }

    // Validate and sanitize application_status
    const validStatuses = ['applied', 'under_review', 'accepted', 'rejected', 'confirmed', 'completed'];
    let applicationStatus = facilityData.application_status?.toLowerCase().trim() || 'applied';

    if (!validStatuses.includes(applicationStatus)) {
      throw new StringError(`Invalid application_status: "${facilityData.application_status}". Must be one of: ${validStatuses.join(', ')}`);
    }

    // Create facility record
    const facility = new FacilityRecords();
    facility.student = student;
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
    facility.application_status = applicationStatus as 'applied' | 'under_review' | 'accepted' | 'rejected' | 'confirmed' | 'completed';

    const savedFacility = await queryRunner.manager.save(FacilityRecords, facility);
    console.log('✅ Facility record added successfully');

    return savedFacility;
  });
};

// Add Address Change Request
const addAddressChangeRequest = async (studentId: number, requestData: ICreateAddressChangeRequest) => {
  return await TransactionUtility.executeInTransaction(async (queryRunner) => {
    console.log('📝 Adding address change request for student:', studentId);
    console.log('📦 Request data received:', JSON.stringify(requestData, null, 2));

    // Verify student exists
    const student = await queryRunner.manager.findOne(Student, {
      where: { student_id: studentId, isDeleted: false },
      relations: ['addresses']
    });

    if (!student) {
      throw new StringError('Student not found');
    }

    // Support nested change_request structure
    const changeRequestData = requestData.change_request || requestData;
    console.log('📋 Change request data:', JSON.stringify(changeRequestData, null, 2));

    // Check if detailed address fields are provided (at root level)
    const hasDetailedAddress = requestData.line1 || requestData.city || requestData.state;
    console.log('🏠 Has detailed address:', hasDetailedAddress);

    // Format new address text from detailed fields if provided
    let newAddressText = changeRequestData.new_address;
    if (hasDetailedAddress) {
      newAddressText = [
        requestData.line1,
        requestData.line2,
        requestData.suburb,
        requestData.city,
        requestData.state,
        requestData.country,
        requestData.postal_code
      ].filter(part => part).join(', ');
      console.log('📍 Formatted new address:', newAddressText);
    }

    // Create address change request (existing functionality)
    const request = new AddressChangeRequest();
    request.student = student;
    request.current_address = changeRequestData.current_address;
    request.new_address = newAddressText || changeRequestData.new_address;
    request.effective_date = changeRequestData.effective_date;
    request.change_reason = changeRequestData.change_reason;
    request.impact_acknowledged = changeRequestData.impact_acknowledged || false;
    request.status = changeRequestData.status || 'pending';
    request.reviewed_at = changeRequestData.reviewed_at;
    request.reviewed_by = changeRequestData.reviewed_by;
    request.review_comments = changeRequestData.review_comments;

    console.log('💾 Saving address change request:', {
      current_address: request.current_address,
      new_address: request.new_address,
      effective_date: request.effective_date,
      change_reason: request.change_reason,
      status: request.status
    });

    const savedRequest = await queryRunner.manager.save(AddressChangeRequest, request);
    console.log('✅ Address change request added successfully with ID:', savedRequest.acr_id);

    // NEW FEATURE: If detailed address fields provided, update addresses table
    if (hasDetailedAddress) {
      console.log('🏠 Updating addresses table with new address details...');

      // If is_primary is true, unset other primary addresses
      if (requestData.is_primary) {
        console.log('🔄 Unsetting other primary addresses...');
        await queryRunner.manager.update(
          Address,
          { student: { student_id: studentId }, is_primary: true },
          { is_primary: false }
        );
      }

      // Create new address record
      const newAddress = new Address();
      newAddress.student = student;
      newAddress.line1 = requestData.line1;
      newAddress.line2 = requestData.line2;
      newAddress.suburb = requestData.suburb;
      newAddress.city = requestData.city;
      newAddress.state = requestData.state;
      newAddress.country = requestData.country;
      newAddress.postal_code = requestData.postal_code;
      newAddress.address_type = requestData.address_type || 'current';
      newAddress.is_primary = requestData.is_primary !== undefined ? requestData.is_primary : true;

      console.log('💾 Saving new address:', {
        line1: newAddress.line1,
        city: newAddress.city,
        state: newAddress.state,
        is_primary: newAddress.is_primary
      });

      const savedAddress = await queryRunner.manager.save(Address, newAddress);
      console.log('✅ Address updated in addresses table with ID:', savedAddress.address_id);

      return {
        address_change_request: savedRequest,
        address_updated: true,
        new_address_id: savedAddress.address_id
      };
    }

    // Return existing functionality response
    console.log('📤 Returning simple response (no address update)');
    return savedRequest;
  });
};

// Add Job Status Update
const addJobStatusUpdate = async (studentId: number, jobData: ICreateJobStatusUpdate) => {
  return await TransactionUtility.executeInTransaction(async (queryRunner) => {
    console.log('💼 Adding job status update for student:', studentId);

    // Verify student exists
    const student = await queryRunner.manager.findOne(Student, {
      where: { student_id: studentId, isDeleted: false }
    });

    if (!student) {
      throw new StringError('Student not found');
    }

    // Create job status update
    const jobStatus = new JobStatusUpdate();
    jobStatus.student = student;
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

    const savedJobStatus = await queryRunner.manager.save(JobStatusUpdate, jobStatus);
    console.log('✅ Job status update added successfully');

    return savedJobStatus;
  });
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

// Get students list with specific fields: Name, Student Type, Course Completed, City, Status, Created On
const getStudentsList = async (params: IStudentQueryParams) => {
  const studentRepo = getRepository(Student).createQueryBuilder('student')
    .leftJoinAndSelect('student.addresses', 'address', 'address.is_primary = :isPrimary', { isPrimary: true })
    .leftJoinAndSelect('student.contact_details', 'contact')
    .leftJoinAndSelect('student.eligibility_status', 'eligibility')
    .leftJoinAndSelect('student.facility_records', 'facility'); // ← REMOVED status filter to show ALL courses

  // Apply activation_status filter (simplified)
  if (params.activation_status === 'active') {
    // Active: isDeleted = 0 AND status != 'inactive'
    studentRepo.where('student.isDeleted = :isDeleted', { isDeleted: false })
               .andWhere('student.status != :inactiveStatus', { inactiveStatus: 'inactive' });
  } else if (params.activation_status === 'inactive') {
    // Inactive: isDeleted = 1 OR status = 'inactive'
    studentRepo.where('(student.isDeleted = :isDeleted OR student.status = :inactiveStatus)', 
                     { isDeleted: true, inactiveStatus: 'inactive' });
  } else if (params.activation_status === 'all') {
    // All: No filter - show all records
  } else {
    // Default: show only active (isDeleted = 0 AND status != 'inactive')
    studentRepo.where('student.isDeleted = :isDeleted', { isDeleted: false })
               .andWhere('student.status != :inactiveStatus', { inactiveStatus: 'inactive' });
  }

  // Helper function to handle single or multiple values
  const parseFilterValues = (value: string | string[] | undefined): string[] | null => {
    if (!value) return null;
    if (Array.isArray(value)) return value;
    // Support comma-separated values in a single string
    return value.split(',').map(v => v.trim()).filter(v => v);
  };

  // Apply status filter (supports multiple values)
  const statusValues = parseFilterValues(params.status);
  if (statusValues && statusValues.length > 0) {
    studentRepo.andWhere('student.status IN (:...statuses)', { statuses: statusValues });
  }

  // Apply student_type filter (supports multiple values)
  const studentTypeValues = parseFilterValues(params.student_type);
  if (studentTypeValues && studentTypeValues.length > 0) {
    studentRepo.andWhere('student.student_type IN (:...studentTypes)', { studentTypes: studentTypeValues });
  }

  // Apply city filter (supports multiple values)
  const cityValues = parseFilterValues(params.city);
  if (cityValues && cityValues.length > 0) {
    studentRepo.andWhere('address.city IN (:...cities)', { cities: cityValues });
  }

  // Apply name search filter (supports comma-separated names)
  if (params.keyword) {
    // Split by comma to support multiple name searches
    const keywords = params.keyword.split(',').map(k => k.trim()).filter(k => k);
    
    if (keywords.length === 1) {
      // Single keyword - search in first_name OR last_name
      studentRepo.andWhere(
        '(LOWER(student.first_name) LIKE LOWER(:keyword) OR LOWER(student.last_name) LIKE LOWER(:keyword))',
        { keyword: `%${keywords[0]}%` }
      );
    } else {
      // Multiple keywords - search for any of them
      const nameConditions = keywords.map((_, index) => 
        `(LOWER(student.first_name) LIKE LOWER(:keyword${index}) OR LOWER(student.last_name) LIKE LOWER(:keyword${index}))`
      ).join(' OR ');
      
      const keywordParams: any = {};
      keywords.forEach((keyword, index) => {
        keywordParams[`keyword${index}`] = `%${keyword}%`;
      });
      
      studentRepo.andWhere(`(${nameConditions})`, keywordParams);
    }
  }

  // Sorting
  const sortBy = params.sort_by || 'createdAt';
  const sortOrder = params.sort_order === 'asc' ? 'ASC' : 'DESC';
  studentRepo.orderBy(`student.${sortBy}`, sortOrder);

  // Get total count for pagination
  const total = await studentRepo.getCount();
  const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

  // Apply pagination
  studentRepo
    .limit(params.limit || 10)
    .offset(ApiUtility.getOffset(params.limit, params.page));

  const students = await studentRepo.getMany();

  // Format response with specific fields
  const response = students.map(student => {
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

    // Calculate Checklist_approval: all required fields must be true OR override_requested is true OR manual_handling is true
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

  // Apply post-query filters (for fields that require complex logic)
  let filteredResponse = response;

  // Filter by course_completed (supports multiple values)
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

  // Filter by checklist_approval
  if (params.checklist_approval === 'true') {
    filteredResponse = filteredResponse.filter(student => student.checklist_approval === true);
  } else if (params.checklist_approval === 'false') {
    filteredResponse = filteredResponse.filter(student => student.checklist_approval === false);
  }

  // Update pagination if post-query filters were applied
  if (courseValues || params.checklist_approval) {
    const filteredTotal = filteredResponse.length;
    const updatedPagRes = ApiUtility.getPagination(filteredTotal, params.limit, params.page);
    
    // Apply pagination to filtered results
    const start = ApiUtility.getOffset(params.limit, params.page);
    const end = start + (params.limit || 10);
    filteredResponse = filteredResponse.slice(start, end);
    
    return { response: filteredResponse, pagination: updatedPagRes.pagination };
  }

  return { response: filteredResponse, pagination: pagRes.pagination };
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

    const sanitizedStudent: any = ApiUtility.sanitizeStudent(student);

    // Extract latitude and longitude from location POINT
    const locationData: any[] = await getConnection().query(
      `SELECT ST_X(location) as longitude, ST_Y(location) as latitude FROM students WHERE student_id = ?`,
      [params.id]
    );
    
    // Add lat/long to response
    if (locationData && locationData[0]) {
      sanitizedStudent.latitude = locationData[0].latitude;
      sanitizedStudent.longitude = locationData[0].longitude;
    }

    // Get associated user account information
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
};

// Update Student with all related entities
const update = async (params: IUpdateStudent) => {
  return await TransactionUtility.executeInTransaction(async (queryRunner) => {
    console.log('🔄 Starting student update with transaction...');

    const query = { ...baseWhere, student_id: params.student_id };

    // Step 1: Verify student exists
    const student = await queryRunner.manager.findOne(Student, {
      where: query,
      relations: [
        'contact_details',
        'visa_details',
        'addresses',
        'eligibility_status',
        'student_lifestyle',
        'placement_preferences'
      ]
    });

    if (!student) {
      throw new StringError('Student does not exist');
    }

    // Step 2: Update main student fields if provided
    const updateData: Partial<Student> = {};
    if (params.first_name !== undefined) updateData.first_name = params.first_name;
    if (params.last_name !== undefined) updateData.last_name = params.last_name;
    if (params.dob !== undefined) updateData.dob = params.dob;
    if (params.gender !== undefined) updateData.gender = params.gender;
    if (params.nationality !== undefined) updateData.nationality = params.nationality;
    if (params.student_type !== undefined) updateData.student_type = params.student_type;
    if (params.status !== undefined) updateData.status = params.status;

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      await queryRunner.manager.update(Student, query, updateData);
      console.log('✅ Student basic info updated');
    }

    // Update location if latitude and longitude provided
    if (params.latitude !== undefined && params.longitude !== undefined) {
      await queryRunner.manager.query(
        `UPDATE students SET location = POINT(?, ?) WHERE student_id = ?`,
        [params.longitude, params.latitude, params.student_id]
      );
      console.log('✅ Student location updated');
    }

    // Step 3: Update or create contact details if provided
    if (params.contact_details) {
      try {
        console.log('📞 Updating contact details...');

        // Delete existing contact details
        if (student.contact_details && student.contact_details.length > 0) {
          await queryRunner.manager.delete(ContactDetails, {
            student: { student_id: params.student_id }
          });
        }

        // Create new contact details
        const contactDetails = new ContactDetails();
        contactDetails.student = student;
        contactDetails.primary_mobile = params.contact_details.primary_mobile;
        contactDetails.email = params.contact_details.email;
        contactDetails.alternate_contact = params.contact_details.alternate_contact;
        contactDetails.emergency_contact = params.contact_details.emergency_contact;
        contactDetails.emergency_contact_name = params.contact_details.emergency_contact_name;
        contactDetails.relationship = params.contact_details.relationship;
        contactDetails.contact_type = params.contact_details.contact_type || 'mobile';
        contactDetails.is_primary = params.contact_details.is_primary !== undefined ? params.contact_details.is_primary : true;
        contactDetails.verified_at = params.contact_details.verified_at;

        await queryRunner.manager.save(ContactDetails, contactDetails);
        console.log('✅ Contact details updated');
      } catch (error) {
        console.error('❌ Failed to update contact details:', error.message);
        throw new Error(`Failed to update contact details: ${error.message}`);
      }
    }

    // Step 4: Update or create visa details if provided
    if (params.visa_details) {
      try {
        console.log('🛂 Updating visa details...');

        // Delete existing visa details
        if (student.visa_details && student.visa_details.length > 0) {
          await queryRunner.manager.delete(VisaDetails, {
            student: { student_id: params.student_id }
          });
        }

        // Create new visa details
        const visaDetails = new VisaDetails();
        visaDetails.student = student;
        visaDetails.visa_type = params.visa_details.visa_type;
        visaDetails.visa_number = params.visa_details.visa_number;
        visaDetails.start_date = params.visa_details.start_date;
        visaDetails.expiry_date = params.visa_details.expiry_date;
        visaDetails.status = params.visa_details.status || 'active';
        visaDetails.issuing_country = params.visa_details.issuing_country;
        visaDetails.document_path = params.visa_details.document_path;
        visaDetails.work_limitation = params.visa_details.work_limitation;

        await queryRunner.manager.save(VisaDetails, visaDetails);
        console.log('✅ Visa details updated');
      } catch (error) {
        console.error('❌ Failed to update visa details:', error.message);
        throw new Error(`Failed to update visa details: ${error.message}`);
      }
    }

    // Step 5: Update or create addresses if provided
    if (params.addresses && params.addresses.length > 0) {
      try {
        console.log('🏠 Updating addresses...');

        // Delete existing addresses
        if (student.addresses && student.addresses.length > 0) {
          await queryRunner.manager.delete(Address, {
            student: { student_id: params.student_id }
          });
        }

        // Create new addresses
        for (const addressData of params.addresses) {
          const address = new Address();
          address.student = student;
          address.line1 = addressData.line1;
          address.line2 = addressData.line2;
          address.suburb = addressData.suburb;
          address.city = addressData.city;
          address.state = addressData.state;
          address.country = addressData.country;
          address.postal_code = addressData.postal_code;
          address.address_type = addressData.address_type || 'current';
          address.is_primary = addressData.is_primary || false;

          await queryRunner.manager.save(Address, address);
        }
        console.log(`✅ ${params.addresses.length} address(es) updated`);
      } catch (error) {
        console.error('❌ Failed to update addresses:', error.message);
        throw new Error(`Failed to update addresses: ${error.message}`);
      }
    }

    // Step 6: Update or create eligibility status if provided
    if (params.eligibility_status) {
      try {
        console.log('📋 Updating eligibility status...');

        // Delete existing eligibility status
        if (student.eligibility_status && student.eligibility_status.length > 0) {
          await queryRunner.manager.delete(EligibilityStatus, {
            student: { student_id: params.student_id }
          });
        }

        // Validate and sanitize overall_status
        const validStatuses = ['eligible', 'not_eligible', 'pending', 'override'];
        let overallStatus = params.eligibility_status.overall_status?.trim() || 'not_eligible';

        if (!validStatuses.includes(overallStatus)) {
          console.warn(`⚠️ Invalid overall_status received: "${overallStatus}". Using default: "not_eligible"`);
          overallStatus = 'not_eligible';
        }

        // Create new eligibility status
        const eligibilityStatus = new EligibilityStatus();
        eligibilityStatus.student = student;
        eligibilityStatus.classes_completed = params.eligibility_status.classes_completed;
        eligibilityStatus.fees_paid = params.eligibility_status.fees_paid;
        eligibilityStatus.assignments_submitted = params.eligibility_status.assignments_submitted;
        eligibilityStatus.documents_submitted = params.eligibility_status.documents_submitted;
        eligibilityStatus.trainer_consent = params.eligibility_status.trainer_consent;
        eligibilityStatus.override_requested = params.eligibility_status.override_requested;
        eligibilityStatus.manual_override = params.eligibility_status.manual_override || false;
        eligibilityStatus.manual_handling = params.eligibility_status.manual_handling || false;
        eligibilityStatus.requested_by = params.eligibility_status.requested_by;
        eligibilityStatus.reason = params.eligibility_status.reason;
        eligibilityStatus.comments = params.eligibility_status.comments;
        eligibilityStatus.overall_status = overallStatus as 'eligible' | 'not_eligible' | 'pending' | 'override';

        await queryRunner.manager.save(EligibilityStatus, eligibilityStatus);
        console.log('✅ Eligibility status updated');
      } catch (error) {
        console.error('❌ Failed to update eligibility status:', error.message);
        throw new Error(`Failed to update eligibility status: ${error.message}`);
      }
    }

    // Step 7: Update or create student lifestyle if provided
    if (params.student_lifestyle) {
      try {
        console.log('🌟 Updating student lifestyle...');

        // Delete existing lifestyle
        if (student.student_lifestyle && student.student_lifestyle.length > 0) {
          await queryRunner.manager.delete(StudentLifestyle, {
            student: { student_id: params.student_id }
          });
        }

        // Create new lifestyle
        const lifestyle = new StudentLifestyle();
        lifestyle.student = student;
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
        console.log('✅ Student lifestyle updated');
      } catch (error) {
        console.error('❌ Failed to update student lifestyle:', error.message);
        throw new Error(`Failed to update student lifestyle: ${error.message}`);
      }
    }

    // Step 8: Update or create placement preferences if provided
    if (params.placement_preferences) {
      try {
        console.log('🎯 Updating placement preferences...');

        // Delete existing preferences
        if (student.placement_preferences && student.placement_preferences.length > 0) {
          await queryRunner.manager.delete(PlacementPreferences, {
            student: { student_id: params.student_id }
          });
        }

        // Create new preferences
        const preferences = new PlacementPreferences();
        preferences.student = student;
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

        // Validate and set urgency_level
        const validUrgencyLevels = ['immediate', 'within_month', 'within_quarter', 'flexible'];
        const urgencyLevel = params.placement_preferences.urgency_level?.toLowerCase().trim();
        if (urgencyLevel && !validUrgencyLevels.includes(urgencyLevel)) {
          throw new Error(`Invalid urgency_level: "${params.placement_preferences.urgency_level}". Must be one of: ${validUrgencyLevels.join(', ')}`);
        }
        preferences.urgency_level = (urgencyLevel as any) || 'flexible';

        preferences.additional_preferences = params.placement_preferences.additional_preferences;

        await queryRunner.manager.save(PlacementPreferences, preferences);
        console.log('✅ Placement preferences updated');
      } catch (error) {
        console.error('❌ Failed to update placement preferences:', error.message);
        throw new Error(`Failed to update placement preferences: ${error.message}`);
      }
    }

    console.log('🎉 Student update transaction committed successfully!');

    // Return updated student with all details including related entities
    const updatedStudent = await queryRunner.manager.findOne(Student, {
      where: { student_id: params.student_id, isDeleted: false },
      relations: [
        'contact_details',
        'visa_details',
        'addresses',
        'eligibility_status',
        'student_lifestyle',
        'placement_preferences'
      ]
    });

    return ApiUtility.sanitizeStudent(updatedStudent);
  });
};

// List Students with pagination and filtering
const list = async (params: IStudentQueryParams) => {
  let studentRepo = getRepository(Student).createQueryBuilder('student');

  // Apply activation_status filter (simplified)
  if (params.activation_status === 'active') {
    // Active: isDeleted = 0 AND status != 'inactive'
    studentRepo = studentRepo.where('student.isDeleted = :isDeleted', { isDeleted: false })
                             .andWhere('student.status != :inactiveStatus', { inactiveStatus: 'inactive' });
  } else if (params.activation_status === 'inactive') {
    // Inactive: isDeleted = 1 OR status = 'inactive'
    studentRepo = studentRepo.where('(student.isDeleted = :isDeleted OR student.status = :inactiveStatus)', 
                                   { isDeleted: true, inactiveStatus: 'inactive' });
  } else if (params.activation_status === 'all') {
    // All: No filter - show all records
  } else {
    // Default: show only active (isDeleted = 0 AND status != 'inactive')
    studentRepo = studentRepo.where('student.isDeleted = :isDeleted', { isDeleted: false })
                             .andWhere('student.status != :inactiveStatus', { inactiveStatus: 'inactive' });
  }

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
    // Get all student IDs
    const studentIds = students.map(s => s.student_id);
    
    // Fetch lat/long for all students in one query
    const locationData: any[] = await getConnection().query(
      `SELECT student_id, ST_X(location) as longitude, ST_Y(location) as latitude 
       FROM students WHERE student_id IN (?)`,
      [studentIds]
    );
    
    // Create a map for quick lookup
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

  // Apply activation_status filter (simplified)
  if (params.activation_status === 'active') {
    // Active: isDeleted = 0 AND status != 'inactive'
    studentRepo = studentRepo.where('student.isDeleted = :isDeleted', { isDeleted: false })
                             .andWhere('student.status != :inactiveStatus', { inactiveStatus: 'inactive' });
  } else if (params.activation_status === 'inactive') {
    // Inactive: isDeleted = 1 OR status = 'inactive'
    studentRepo = studentRepo.where('(student.isDeleted = :isDeleted OR student.status = :inactiveStatus)', 
                                   { isDeleted: true, inactiveStatus: 'inactive' });
  } else if (params.activation_status === 'all') {
    // All: No filter - show all records
  } else {
    // Default: show only active (isDeleted = 0 AND status != 'inactive')
    studentRepo = studentRepo.where('student.isDeleted = :isDeleted', { isDeleted: false })
                             .andWhere('student.status != :inactiveStatus', { inactiveStatus: 'inactive' });
  }

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

// Get list of facilities where student has enrolled (applied or assigned)
const getStudentFacilities = async (studentId: number) => {
  try {
    // Verify student exists
    const student = await getRepository(Student).findOne({
      where: { student_id: studentId, isDeleted: false }
    });

    if (!student) {
      throw new StringError('Student not found');
    }

    // Get facilities from facility_records (self-placement/applications)
    const facilityRecords = await getRepository(FacilityRecords).find({
      where: { student_id: studentId },
      relations: [] // We don't need to load the student relation again
    });

    // Get facilities from placement assignments (through placement_slot -> facility)
    const placementAssignments = await getRepository(PlacementAssignment).find({
      where: { student_id: studentId },
      relations: ['placementSlot', 'placementSlot.facility']
    });

    // Extract facility IDs from both sources and get facility details
    const facilityIdsFromRecords = facilityRecords.map(record => record.facility_id);
    const facilityIdsFromAssignments = placementAssignments
      .map(assignment => assignment.placementSlot?.facility?.facility_id)
      .filter((id): id is number => id !== undefined && id !== null);

    // Combine and deduplicate facility IDs
    const allFacilityIds = [...new Set([...facilityIdsFromRecords, ...facilityIdsFromAssignments])];

    // Fetch facility details for all unique facility IDs
    const facilities = allFacilityIds.length > 0 
      ? await getRepository(Facility).findByIds(allFacilityIds)
      : [];

    // Format response with facility information
    const facilityList = facilities.map(facility => ({
      facility_id: facility.facility_id,
      organization_name: facility.organization_name,
      registered_business_name: facility.registered_business_name,
      website_url: facility.website_url,
      abn_registration_number: facility.abn_registration_number,
      source_of_data: facility.source_of_data,
      states_covered: facility.states_covered,
      categories: facility.categories
    }));

    return {
      success: true,
      message: `Retrieved ${facilityList.length} facilities for student`,
      data: facilityList
    };
  } catch (error) {
    if (error instanceof StringError) {
      throw error;
    }
    console.error('Error in getStudentFacilities:', error);
    throw new StringError('Failed to retrieve student facilities');
  }
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
};

// Add Self Placement
const addSelfPlacement = async (studentId: number, placementData: ICreateSelfPlacement) => {
  return await TransactionUtility.executeInTransaction(async (queryRunner) => {
    console.log('🏥 Adding self placement for student:', studentId);

    // Verify student exists
    const student = await queryRunner.manager.findOne(Student, {
      where: { student_id: studentId, isDeleted: false }
    });

    if (!student) {
      throw new StringError('Student not found');
    }

    // Validate status
    const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];
    let status = placementData.status?.toLowerCase().trim() || 'pending';

    if (!validStatuses.includes(status)) {
      throw new StringError(`Invalid status: "${placementData.status}". Must be one of: ${validStatuses.join(', ')}`);
    }

    // Create self placement record
    const selfPlacement = new SelfPlacement();
    selfPlacement.student = student;
    selfPlacement.facility_name = placementData.facility_name;
    selfPlacement.facility_type = placementData.facility_type;
    selfPlacement.facility_address = placementData.facility_address;
    selfPlacement.contact_person_name = placementData.contact_person_name;
    selfPlacement.contact_email = placementData.contact_email;
    selfPlacement.contact_phone = placementData.contact_phone;
    selfPlacement.supervisor_name = placementData.supervisor_name;
    selfPlacement.supporting_documents_path = placementData.supporting_documents_path;
    selfPlacement.offer_letter_path = placementData.offer_letter_path;
    selfPlacement.registration_proof_path = placementData.registration_proof_path;
    selfPlacement.status = status as 'pending' | 'under_review' | 'approved' | 'rejected';
    selfPlacement.student_comments = placementData.student_comments;
    selfPlacement.reviewed_at = placementData.reviewed_at;
    selfPlacement.reviewed_by = placementData.reviewed_by;
    selfPlacement.review_comments = placementData.review_comments;

    const savedPlacement = await queryRunner.manager.save(SelfPlacement, selfPlacement);
    console.log('✅ Self placement added successfully');

    return savedPlacement;
  });
};

// Update Address Change Request
const updateAddressChangeRequest = async (params: IUpdateAddressChangeRequest) => {
  return await TransactionUtility.executeInTransaction(async (queryRunner) => {
    console.log('🔄 Updating address change request:', params.acr_id);

    // Find existing record
    const existingRequest = await queryRunner.manager.findOne(AddressChangeRequest, {
      where: { acr_id: params.acr_id }
    });

    if (!existingRequest) {
      throw new StringError('Address change request not found');
    }

    // Build update data
    const updateData: Partial<AddressChangeRequest> = {};
    if (params.current_address !== undefined) updateData.current_address = params.current_address;
    if (params.new_address !== undefined) updateData.new_address = params.new_address;
    if (params.effective_date !== undefined) updateData.effective_date = params.effective_date;
    if (params.change_reason !== undefined) updateData.change_reason = params.change_reason;
    if (params.impact_acknowledged !== undefined) updateData.impact_acknowledged = params.impact_acknowledged;
    if (params.status !== undefined) updateData.status = params.status;
    if (params.reviewed_at !== undefined) updateData.reviewed_at = params.reviewed_at;
    if (params.reviewed_by !== undefined) updateData.reviewed_by = params.reviewed_by;
    if (params.review_comments !== undefined) updateData.review_comments = params.review_comments;

    // Update the record
    await queryRunner.manager.update(AddressChangeRequest, { acr_id: params.acr_id }, updateData);

    // Fetch and return updated record
    const updatedRequest = await queryRunner.manager.findOne(AddressChangeRequest, {
      where: { acr_id: params.acr_id }
    });

    console.log('✅ Address change request updated successfully');
    return updatedRequest;
  });
};

// Update Job Status Update
const updateJobStatusUpdate = async (params: IUpdateJobStatusUpdate) => {
  return await TransactionUtility.executeInTransaction(async (queryRunner) => {
    console.log('🔄 Updating job status update:', params.jsu_id);

    // Find existing record
    const existingJobStatus = await queryRunner.manager.findOne(JobStatusUpdate, {
      where: { jsu_id: params.jsu_id }
    });

    if (!existingJobStatus) {
      throw new StringError('Job status update not found');
    }

    // Build update data
    const updateData: Partial<JobStatusUpdate> = {};
    if (params.status !== undefined) updateData.status = params.status;
    if (params.last_updated_on !== undefined) updateData.last_updated_on = params.last_updated_on;
    if (params.employer_name !== undefined) updateData.employer_name = params.employer_name;
    if (params.job_role !== undefined) updateData.job_role = params.job_role;
    if (params.start_date !== undefined) updateData.start_date = params.start_date;
    if (params.employment_type !== undefined) updateData.employment_type = params.employment_type;
    if (params.offer_letter_path !== undefined) updateData.offer_letter_path = params.offer_letter_path;
    if (params.actively_applying !== undefined) updateData.actively_applying = params.actively_applying;
    if (params.expected_timeline !== undefined) updateData.expected_timeline = params.expected_timeline;
    if (params.searching_comments !== undefined) updateData.searching_comments = params.searching_comments;

    // Update the record
    await queryRunner.manager.update(JobStatusUpdate, { jsu_id: params.jsu_id }, updateData);

    // Fetch and return updated record
    const updatedJobStatus = await queryRunner.manager.findOne(JobStatusUpdate, {
      where: { jsu_id: params.jsu_id }
    });

    console.log('✅ Job status update updated successfully');
    return updatedJobStatus;
  });
};

// Update Self Placement
const updateSelfPlacement = async (params: IUpdateSelfPlacement) => {
  return await TransactionUtility.executeInTransaction(async (queryRunner) => {
    console.log('🔄 Updating self placement:', params.placement_id);

    // Find existing record
    const existingPlacement = await queryRunner.manager.findOne(SelfPlacement, {
      where: { placement_id: params.placement_id }
    });

    if (!existingPlacement) {
      throw new StringError('Self placement not found');
    }

    // Validate status if provided
    if (params.status) {
      const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];
      const status = params.status.toLowerCase().trim();
      if (!validStatuses.includes(status)) {
        throw new StringError(`Invalid status: "${params.status}". Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Build update data
    const updateData: Partial<SelfPlacement> = {};
    if (params.facility_name !== undefined) updateData.facility_name = params.facility_name;
    if (params.facility_type !== undefined) updateData.facility_type = params.facility_type;
    if (params.facility_address !== undefined) updateData.facility_address = params.facility_address;
    if (params.contact_person_name !== undefined) updateData.contact_person_name = params.contact_person_name;
    if (params.contact_email !== undefined) updateData.contact_email = params.contact_email;
    if (params.contact_phone !== undefined) updateData.contact_phone = params.contact_phone;
    if (params.supervisor_name !== undefined) updateData.supervisor_name = params.supervisor_name;
    if (params.supporting_documents_path !== undefined) updateData.supporting_documents_path = params.supporting_documents_path;
    if (params.offer_letter_path !== undefined) updateData.offer_letter_path = params.offer_letter_path;
    if (params.registration_proof_path !== undefined) updateData.registration_proof_path = params.registration_proof_path;
    if (params.status !== undefined) updateData.status = params.status;
    if (params.student_comments !== undefined) updateData.student_comments = params.student_comments;
    if (params.reviewed_at !== undefined) updateData.reviewed_at = params.reviewed_at;
    if (params.reviewed_by !== undefined) updateData.reviewed_by = params.reviewed_by;
    if (params.review_comments !== undefined) updateData.review_comments = params.review_comments;

    // Update the record
    await queryRunner.manager.update(SelfPlacement, { placement_id: params.placement_id }, updateData);

    // Fetch and return updated record
    const updatedPlacement = await queryRunner.manager.findOne(SelfPlacement, {
      where: { placement_id: params.placement_id }
    });

    console.log('✅ Self placement updated successfully');
    return updatedPlacement;
  });
};

// Self Placement interface
export interface ICreateSelfPlacement {
  facility_name: string;
  facility_type?: string;
  facility_address?: string;
  contact_person_name?: string;
  contact_email?: string;
  contact_phone?: string;
  supervisor_name?: string;
  supporting_documents_path?: string;
  offer_letter_path?: string;
  registration_proof_path?: string;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected';
  student_comments?: string;
  reviewed_at?: Date;
  reviewed_by?: string;
  review_comments?: string;
}

// Update interfaces
export interface IUpdateAddressChangeRequest {
  acr_id: number;
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

export interface IUpdateJobStatusUpdate {
  jsu_id: number;
  status?: string;
  last_updated_on?: Date;
  employer_name?: string;
  job_role?: string;
  start_date?: Date;
  employment_type?: string;
  offer_letter_path?: string;
  actively_applying?: boolean;
  expected_timeline?: string;
  searching_comments?: string;
}

export interface IUpdateSelfPlacement {
  placement_id: number;
  facility_name?: string;
  facility_type?: string;
  facility_address?: string;
  contact_person_name?: string;
  contact_email?: string;
  contact_phone?: string;
  supervisor_name?: string;
  supporting_documents_path?: string;
  offer_letter_path?: string;
  registration_proof_path?: string;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected';
  student_comments?: string;
  reviewed_at?: Date;
  reviewed_by?: string;
  review_comments?: string;
}

// Bulk upload result interface
interface IBulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ row: number; email?: string; errors: string[] }>;
  createdStudents: Array<{ student_id: number; email: string; full_name: string }>;
}

// Bulk upload row interface
interface IBulkStudentRow {
  first_name: string;
  last_name: string;
  dob: string;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status?: string;
  email?: string;
  password?: string;
  login_status?: string;
  
  // Contact details
  primary_mobile?: string;
  alternate_contact?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  relationship?: string;
  contact_type?: string;
  
  // Visa details
  visa_type?: string;
  visa_number?: string;
  visa_start_date?: string;
  visa_expiry_date?: string;
  visa_status?: string;
  issuing_country?: string;
  work_limitation?: string;
  
  // Address
  address_line1?: string;
  address_line2?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  address_type?: string;
  
  // Eligibility status
  classes_completed?: string;
  fees_paid?: string;
  assignments_submitted?: string;
  documents_submitted?: string;
  trainer_consent?: string;
  overall_status?: string;
  
  // Student lifestyle
  currently_working?: string;
  working_hours?: string;
  has_dependents?: string;
  married?: string;
  driving_license?: string;
  own_vehicle?: string;
  public_transport_only?: string;
  fully_flexible?: string;
  
  // Placement preferences
  preferred_states?: string;
  preferred_cities?: string;
  max_travel_distance_km?: string;
  morning_only?: string;
  evening_only?: string;
  part_time?: string;
  full_time?: string;
  urgency_level?: string;
  
  // Location
  latitude?: string;
  longitude?: string;
}

// Validate student row
const validateStudentRow = (row: IBulkStudentRow, rowIndex: number): string[] => {
  const errors: string[] = [];
  
  // Required fields
  if (!row.first_name || row.first_name.trim() === '') {
    errors.push('first_name is required');
  }
  if (!row.last_name || row.last_name.trim() === '') {
    errors.push('last_name is required');
  }
  if (!row.dob || row.dob.trim() === '') {
    errors.push('dob is required');
  } else {
    const dobDate = new Date(row.dob);
    if (isNaN(dobDate.getTime())) {
      errors.push('dob must be a valid date (YYYY-MM-DD)');
    }
  }
  
  // Email validation (if provided)
  if (row.email && row.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
      errors.push('email must be a valid email address');
    }
  }
  
  // Gender validation
  if (row.gender && !['male', 'female', 'other'].includes(row.gender.toLowerCase())) {
    errors.push('gender must be male, female, or other');
  }
  
  // Student type validation
  if (row.student_type && !['domestic', 'international', 'external'].includes(row.student_type.toLowerCase())) {
    errors.push('student_type must be domestic, international, or external');
  }
  
  // Status validation
  const validStatuses = ['active', 'inactive', 'internship_completed', 'eligible_for_certification', 'placement_initiated', 'self_placement_verification_pending', 'self_placement_approved', 'certified', 'completed', 'graduated', 'withdrawn'];
  if (row.status && !validStatuses.includes(row.status.toLowerCase())) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }
  
  // Visa dates validation
  if (row.visa_start_date && row.visa_start_date.trim() !== '') {
    const visaStartDate = new Date(row.visa_start_date);
    if (isNaN(visaStartDate.getTime())) {
      errors.push('visa_start_date must be a valid date (YYYY-MM-DD)');
    }
  }
  if (row.visa_expiry_date && row.visa_expiry_date.trim() !== '') {
    const visaExpiryDate = new Date(row.visa_expiry_date);
    if (isNaN(visaExpiryDate.getTime())) {
      errors.push('visa_expiry_date must be a valid date (YYYY-MM-DD)');
    }
  }
  
  // Urgency level validation
  if (row.urgency_level && !['immediate', 'within_month', 'within_quarter', 'flexible'].includes(row.urgency_level.toLowerCase())) {
    errors.push('urgency_level must be immediate, within_month, within_quarter, or flexible');
  }
  
  // Latitude validation (optional, but if provided must be valid)
  if (row.latitude && row.latitude.trim() !== '') {
    const lat = parseFloat(row.latitude);
    if (isNaN(lat)) {
      errors.push('latitude must be a valid number');
    } else if (lat < -90 || lat > 90) {
      errors.push('latitude must be between -90 and 90');
    }
  }
  
  // Longitude validation (optional, but if provided must be valid)
  if (row.longitude && row.longitude.trim() !== '') {
    const lng = parseFloat(row.longitude);
    if (isNaN(lng)) {
      errors.push('longitude must be a valid number');
    } else if (lng < -180 || lng > 180) {
      errors.push('longitude must be between -180 and 180');
    }
  }
  
  // If one coordinate is provided, both must be provided
  if ((row.latitude && row.latitude.trim() !== '' && (!row.longitude || row.longitude.trim() === '')) ||
      (row.longitude && row.longitude.trim() !== '' && (!row.latitude || row.latitude.trim() === ''))) {
    errors.push('Both latitude and longitude must be provided together');
  }
  
  return errors;
};

// Convert Excel row to student data
const convertRowToStudent = (row: IBulkStudentRow): ICreateStudent => {
  const studentData: ICreateStudent = {
    first_name: row.first_name.trim(),
    last_name: row.last_name.trim(),
    dob: new Date(row.dob),
    gender: row.gender?.trim(),
    nationality: row.nationality?.trim(),
    student_type: row.student_type?.toLowerCase().trim() || 'domestic',
    status: (row.status?.toLowerCase().trim() as any) || 'active'
  };
  
  // Add login credentials if provided
  if (row.email && row.email.trim() !== '') {
    studentData.login = {
      email: row.email.trim(),
      password: row.password?.trim() || '',
      status: (row.login_status?.toLowerCase().trim() as any) || 'active'
    };
  }
  
  // Add contact details if any contact field is provided
  if (row.primary_mobile || row.email || row.alternate_contact || row.emergency_contact) {
    studentData.contact_details = {
      primary_mobile: row.primary_mobile?.trim(),
      email: row.email?.trim(),
      alternate_contact: row.alternate_contact?.trim(),
      emergency_contact: row.emergency_contact?.trim(),
      emergency_contact_name: row.emergency_contact_name?.trim(),
      relationship: row.relationship?.trim(),
      contact_type: (row.contact_type?.toLowerCase().trim() as any) || 'mobile',
      is_primary: true
    };
  }
  
  // Add visa details if any visa field is provided
  if (row.visa_type || row.visa_number) {
    studentData.visa_details = {
      visa_type: row.visa_type?.trim(),
      visa_number: row.visa_number?.trim(),
      start_date: row.visa_start_date ? new Date(row.visa_start_date) : undefined,
      expiry_date: row.visa_expiry_date ? new Date(row.visa_expiry_date) : undefined,
      status: (row.visa_status?.toLowerCase().trim() as any) || 'active',
      issuing_country: row.issuing_country?.trim(),
      work_limitation: row.work_limitation?.trim()
    };
  }
  
  // Add address if any address field is provided
  if (row.address_line1 || row.city) {
    studentData.addresses = [{
      line1: row.address_line1?.trim(),
      line2: row.address_line2?.trim(),
      suburb: row.suburb?.trim(),
      city: row.city?.trim(),
      state: row.state?.trim(),
      country: row.country?.trim(),
      postal_code: row.postal_code?.trim(),
      address_type: (row.address_type?.toLowerCase().trim() as any) || 'current',
      is_primary: true
    }];
  }
  
  // Add eligibility status if any eligibility field is provided
  if (row.classes_completed || row.fees_paid || row.overall_status) {
    const parseBool = (val?: string) => val?.toLowerCase() === 'true' || val?.toLowerCase() === 'yes' || val === '1';
    studentData.eligibility_status = {
      classes_completed: parseBool(row.classes_completed),
      fees_paid: parseBool(row.fees_paid),
      assignments_submitted: parseBool(row.assignments_submitted),
      documents_submitted: parseBool(row.documents_submitted),
      trainer_consent: parseBool(row.trainer_consent),
      overall_status: (row.overall_status?.toLowerCase().trim() as any) || 'not_eligible'
    };
  }
  
  // Add student lifestyle if any lifestyle field is provided
  if (row.currently_working || row.married || row.driving_license) {
    const parseBool = (val?: string) => val?.toLowerCase() === 'true' || val?.toLowerCase() === 'yes' || val === '1';
    studentData.student_lifestyle = {
      currently_working: parseBool(row.currently_working),
      working_hours: row.working_hours?.trim(),
      has_dependents: parseBool(row.has_dependents),
      married: parseBool(row.married),
      driving_license: parseBool(row.driving_license),
      own_vehicle: parseBool(row.own_vehicle),
      public_transport_only: parseBool(row.public_transport_only),
      fully_flexible: parseBool(row.fully_flexible)
    };
  }
  
  // Add placement preferences if any preference field is provided
  if (row.preferred_states || row.preferred_cities || row.urgency_level) {
    const parseBool = (val?: string) => val?.toLowerCase() === 'true' || val?.toLowerCase() === 'yes' || val === '1';
    studentData.placement_preferences = {
      preferred_states: row.preferred_states?.trim(),
      preferred_cities: row.preferred_cities?.trim(),
      max_travel_distance_km: row.max_travel_distance_km ? parseInt(row.max_travel_distance_km) : undefined,
      morning_only: parseBool(row.morning_only),
      evening_only: parseBool(row.evening_only),
      part_time: parseBool(row.part_time),
      full_time: parseBool(row.full_time),
      urgency_level: (row.urgency_level?.toLowerCase().trim() as any) || 'flexible'
    };
  }
  
  // Add location if both latitude and longitude are provided
  if (row.latitude && row.latitude.trim() !== '' && row.longitude && row.longitude.trim() !== '') {
    studentData.latitude = parseFloat(row.latitude);
    studentData.longitude = parseFloat(row.longitude);
  }
  
  return studentData;
};

// Bulk upload students from Excel
const bulkUpload = async (filePath: string): Promise<IBulkUploadResult> => {
  const result: IBulkUploadResult = {
    success: false,
    totalRows: 0,
    successCount: 0,
    failureCount: 0,
    errors: [],
    createdStudents: []
  };

  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  try {
    // Parse Excel file
    const excelData = ExcelUtility.parseExcelFile<IBulkStudentRow>(filePath);
    result.totalRows = excelData.length;

    console.log(`📋 Processing ${excelData.length} student records from Excel file`);

    if (excelData.length === 0) {
      throw new Error('Excel file contains no data rows with actual content');
    }

    // Capacity check
    if (excelData.length > 2000) {
      throw new Error(`File contains ${excelData.length} rows. Maximum allowed is 2000 records per upload. Please split into smaller files.`);
    }

    // Required columns for validation
    const requiredFields = ['first_name', 'last_name', 'dob'];

    // Validate Excel structure
    const structureErrors = ExcelUtility.validateExcelStructure(excelData, requiredFields);
    if (structureErrors.length > 0) {
      result.errors.push({
        row: 0,
        errors: structureErrors.map(err => err.message)
      });
      return result;
    }

    // PHASE 1: Validate ALL records first
    console.log('🔍 Phase 1: Validating all records...');
    
    const validationErrors: Array<{ row: number; email?: string; errors: string[] }> = [];
    const validatedData: Array<{ rowIndex: number; data: ICreateStudent }> = [];

    for (let i = 0; i < excelData.length; i++) {
      const rowIndex = i + 2; // Excel row number (accounting for header)
      const row = excelData[i];

      // Validate row data
      const rowErrors = validateStudentRow(row, rowIndex);
      if (rowErrors.length > 0) {
        validationErrors.push({
          row: rowIndex,
          email: row.email,
          errors: rowErrors
        });
        continue;
      }

      // Convert row to student object
      const studentData = convertRowToStudent(row);
      validatedData.push({
        rowIndex,
        data: studentData
      });
    }

    // If ANY validation errors, fail the entire operation
    if (validationErrors.length > 0) {
      result.errors = validationErrors;
      result.failureCount = validationErrors.length;
      result.successCount = 0;
      throw new Error(`Validation failed for ${validationErrors.length} records. All records must be valid for bulk upload to proceed.`);
    }

    // PHASE 2: Check for duplicates
    console.log('🔍 Phase 2: Checking for duplicate emails...');
    
    const allEmails = validatedData
      .filter(item => item.data.login?.email)
      .map(item => item.data.login!.email.toLowerCase());

    // Check for duplicates within the file itself
    const emailDuplicates = allEmails.filter((email, index) => allEmails.indexOf(email) !== index);

    if (emailDuplicates.length > 0) {
      throw new Error(`Duplicate emails found within the file: ${[...new Set(emailDuplicates)].join(', ')}`);
    }

    // Check for existing records in database (only for students with email)
    if (allEmails.length > 0) {
      const existingUsers = await getRepository(User).find({ 
        where: { loginID: In(allEmails) } 
      });

      if (existingUsers.length > 0) {
        const existingLoginIds = existingUsers.map(u => u.loginID).join(', ');
        throw new Error(`The following emails already exist in the system: ${existingLoginIds}`);
      }
    }

    // PHASE 3: Pre-hash all passwords
    console.log('🔐 Phase 3: Hashing passwords...');
    
    const passwordHashPromises = validatedData.map(async (item, index) => {
      if (item.data.login?.password) {
        return {
          index,
          hashedPassword: await PasswordUtility.hashPassword(item.data.login.password)
        };
      }
      return { index, hashedPassword: null };
    });

    const hashedPasswords = await Promise.all(passwordHashPromises);
    const passwordMap = new Map(hashedPasswords.map(p => [p.index, p.hashedPassword]));

    // PHASE 4: Get student role ID
    const studentRoleId = await RoleService.getRoleIdByName('Student');

    // PHASE 5: Start single transaction for ALL database operations
    console.log('💾 Phase 5: Starting database transaction for all records...');
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdStudents: Array<{ student_id: number; email: string; full_name: string }> = [];

    try {
      // Process all records within the single transaction
      for (let i = 0; i < validatedData.length; i++) {
        const { data: studentData, rowIndex } = validatedData[i];
        
        console.log(`📝 Creating student ${i + 1}/${validatedData.length}: ${studentData.first_name} ${studentData.last_name}`);

        // Create student record
        const student = new Student();
        student.first_name = studentData.first_name;
        student.last_name = studentData.last_name;
        student.dob = studentData.dob;
        student.gender = studentData.gender;
        student.nationality = studentData.nationality;
        student.student_type = studentData.student_type || 'domestic';
        student.status = studentData.status || 'active';

        const savedStudent = await queryRunner.manager.save(Student, student);
        
        // Set location if latitude and longitude are provided
        if (studentData.latitude !== undefined && studentData.longitude !== undefined) {
          await queryRunner.manager.query(
            `UPDATE students SET location = POINT(?, ?) WHERE student_id = ?`,
            [studentData.longitude, studentData.latitude, savedStudent.student_id]
          );
        } else {
          // Set default location POINT(0, 0)
          await queryRunner.manager.query(
            `UPDATE students SET location = POINT(0, 0) WHERE student_id = ?`,
            [savedStudent.student_id]
          );
        }

        // Create contact details if provided
        if (studentData.contact_details) {
          const contactDetails = new ContactDetails();
          contactDetails.student = savedStudent;
          contactDetails.primary_mobile = studentData.contact_details.primary_mobile;
          contactDetails.email = studentData.contact_details.email;
          contactDetails.alternate_contact = studentData.contact_details.alternate_contact;
          contactDetails.emergency_contact = studentData.contact_details.emergency_contact;
          contactDetails.emergency_contact_name = studentData.contact_details.emergency_contact_name;
          contactDetails.relationship = studentData.contact_details.relationship;
          contactDetails.contact_type = studentData.contact_details.contact_type || 'mobile';
          contactDetails.is_primary = true;

          await queryRunner.manager.save(ContactDetails, contactDetails);
        }

        // Create visa details if provided
        if (studentData.visa_details) {
          const visaDetails = new VisaDetails();
          visaDetails.student = savedStudent;
          visaDetails.visa_type = studentData.visa_details.visa_type;
          visaDetails.visa_number = studentData.visa_details.visa_number;
          visaDetails.start_date = studentData.visa_details.start_date;
          visaDetails.expiry_date = studentData.visa_details.expiry_date;
          visaDetails.status = studentData.visa_details.status || 'active';
          visaDetails.issuing_country = studentData.visa_details.issuing_country;
          visaDetails.work_limitation = studentData.visa_details.work_limitation;

          await queryRunner.manager.save(VisaDetails, visaDetails);
        }

        // Create addresses if provided
        if (studentData.addresses && studentData.addresses.length > 0) {
          for (const addressData of studentData.addresses) {
            const address = new Address();
            address.student = savedStudent;
            address.line1 = addressData.line1;
            address.line2 = addressData.line2;
            address.suburb = addressData.suburb;
            address.city = addressData.city;
            address.state = addressData.state;
            address.country = addressData.country;
            address.postal_code = addressData.postal_code;
            address.address_type = addressData.address_type || 'current';
            address.is_primary = addressData.is_primary || false;

            await queryRunner.manager.save(Address, address);
          }
        }

        // Create eligibility status if provided
        if (studentData.eligibility_status) {
          const eligibilityStatus = new EligibilityStatus();
          eligibilityStatus.student = savedStudent;
          eligibilityStatus.classes_completed = studentData.eligibility_status.classes_completed;
          eligibilityStatus.fees_paid = studentData.eligibility_status.fees_paid;
          eligibilityStatus.assignments_submitted = studentData.eligibility_status.assignments_submitted;
          eligibilityStatus.documents_submitted = studentData.eligibility_status.documents_submitted;
          eligibilityStatus.trainer_consent = studentData.eligibility_status.trainer_consent;
          eligibilityStatus.overall_status = studentData.eligibility_status.overall_status as any || 'not_eligible';

          await queryRunner.manager.save(EligibilityStatus, eligibilityStatus);
        }

        // Create student lifestyle if provided
        if (studentData.student_lifestyle) {
          const lifestyle = new StudentLifestyle();
          lifestyle.student = savedStudent;
          lifestyle.currently_working = studentData.student_lifestyle.currently_working;
          lifestyle.working_hours = studentData.student_lifestyle.working_hours;
          lifestyle.has_dependents = studentData.student_lifestyle.has_dependents;
          lifestyle.married = studentData.student_lifestyle.married;
          lifestyle.driving_license = studentData.student_lifestyle.driving_license;
          lifestyle.own_vehicle = studentData.student_lifestyle.own_vehicle;
          lifestyle.public_transport_only = studentData.student_lifestyle.public_transport_only;
          lifestyle.fully_flexible = studentData.student_lifestyle.fully_flexible;

          await queryRunner.manager.save(StudentLifestyle, lifestyle);
        }

        // Create placement preferences if provided
        if (studentData.placement_preferences) {
          const preferences = new PlacementPreferences();
          preferences.student = savedStudent;
          preferences.preferred_states = studentData.placement_preferences.preferred_states;
          preferences.preferred_cities = studentData.placement_preferences.preferred_cities;
          preferences.max_travel_distance_km = studentData.placement_preferences.max_travel_distance_km;
          preferences.morning_only = studentData.placement_preferences.morning_only;
          preferences.evening_only = studentData.placement_preferences.evening_only;
          preferences.part_time = studentData.placement_preferences.part_time;
          preferences.full_time = studentData.placement_preferences.full_time;
          preferences.urgency_level = studentData.placement_preferences.urgency_level as any || 'flexible';

          await queryRunner.manager.save(PlacementPreferences, preferences);
        }

        // Create user account if email and password provided
        if (studentData.login?.email && studentData.login?.password) {
          const user = new User();
          user.loginID = studentData.login.email;
          user.password = passwordMap.get(i); // Use pre-hashed password
          user.roleID = studentRoleId;
          user.studentID = savedStudent.student_id;
          user.facilityID = null;
          user.supervisorID = null;
          user.placementExecutiveID = null;
          user.trainerID = null;
          user.status = studentData.login.status || 'active';

          await queryRunner.manager.save(User, user);
        }

        createdStudents.push({
          student_id: savedStudent.student_id,
          email: studentData.login?.email || studentData.contact_details?.email || '',
          full_name: `${savedStudent.first_name} ${savedStudent.last_name}`
        });
      }

      // If we reach here, all records were processed successfully
      await queryRunner.commitTransaction();
      
      result.success = true;
      result.successCount = createdStudents.length;
      result.failureCount = 0;
      result.createdStudents = createdStudents;
      
      console.log(`✅ All ${createdStudents.length} students created successfully in single transaction`);
      
      return result;

    } catch (dbError) {
      // Rollback the entire transaction if ANY database operation fails
      await queryRunner.rollbackTransaction();
      console.error('❌ Database error occurred, rolling back ALL changes:', dbError.message);
      throw new Error(`Database operation failed: ${dbError.message}. All changes have been rolled back.`);
    }

  } catch (error) {
    console.error('❌ Bulk upload failed:', error.message);
    
    result.success = false;
    
    if (!result.errors || result.errors.length === 0) {
      result.errors.push({
        row: 0,
        errors: [error.message]
      });
    }
    
    return result;
    
  } finally {
    await queryRunner.release();
    
    // Cleanup uploaded file
    ExcelUtility.cleanupFile(filePath);
  }
};

// Generate Excel template for bulk student upload
const generateTemplate = (): Buffer => {
  const headers = [
    'first_name', 'last_name', 'dob', 'gender', 'nationality', 'student_type', 'status',
    'email', 'password', 'login_status',
    'primary_mobile', 'alternate_contact', 'emergency_contact', 'emergency_contact_name', 'relationship', 'contact_type',
    'visa_type', 'visa_number', 'visa_start_date', 'visa_expiry_date', 'visa_status', 'issuing_country', 'work_limitation',
    'address_line1', 'address_line2', 'suburb', 'city', 'state', 'country', 'postal_code', 'address_type',
    'classes_completed', 'fees_paid', 'assignments_submitted', 'documents_submitted', 'trainer_consent', 'overall_status',
    'currently_working', 'working_hours', 'has_dependents', 'married', 'driving_license', 'own_vehicle', 'public_transport_only', 'fully_flexible',
    'preferred_states', 'preferred_cities', 'max_travel_distance_km', 'morning_only', 'evening_only', 'part_time', 'full_time', 'urgency_level',
    'latitude', 'longitude'
  ];

  const sampleData = [
    {
      first_name: 'John',
      last_name: 'Doe',
      dob: '2000-01-15',
      gender: 'male',
      nationality: 'Australian',
      student_type: 'domestic',
      status: 'active',
      email: 'john.doe@example.com',
      password: 'SecurePass123',
      login_status: 'active',
      primary_mobile: '0412345678',
      alternate_contact: '',
      emergency_contact: '0498765432',
      emergency_contact_name: 'Jane Doe',
      relationship: 'Mother',
      contact_type: 'mobile',
      visa_type: '',
      visa_number: '',
      visa_start_date: '',
      visa_expiry_date: '',
      visa_status: '',
      issuing_country: '',
      work_limitation: '',
      address_line1: '123 Main St',
      address_line2: '',
      suburb: 'Suburb',
      city: 'Sydney',
      state: 'NSW',
      country: 'Australia',
      postal_code: '2000',
      address_type: 'current',
      classes_completed: 'true',
      fees_paid: 'true',
      assignments_submitted: 'true',
      documents_submitted: 'true',
      trainer_consent: 'true',
      overall_status: 'eligible',
      currently_working: 'false',
      working_hours: '0',
      has_dependents: 'false',
      married: 'false',
      driving_license: 'true',
      own_vehicle: 'true',
      public_transport_only: 'false',
      fully_flexible: 'true',
      preferred_states: 'NSW,VIC',
      preferred_cities: 'Sydney,Melbourne',
      max_travel_distance_km: '20',
      morning_only: 'false',
      evening_only: 'false',
      part_time: 'false',
      full_time: 'true',
      urgency_level: 'within_month',
      latitude: '-33.8688',
      longitude: '151.2093'
    }
  ];

  return ExcelUtility.generateTemplate(headers, sampleData);
};

const getStudentPlacements = async (studentId: number, filters?: { status?: string; facility_confirmation_status?: string }) => {
  try {
    console.log(`🔍 Fetching placements for student ID: ${studentId}`);
    
    const placements = await PlacementAssignmentRepository.findByStudentId(studentId);
    console.log(`📊 Found ${placements?.length || 0} placements for student ${studentId}`);

    if (!placements || placements.length === 0) {
      console.log(`⚠️ No placements found for student ${studentId}`);
      return {
        success: true,
        message: 'No placements found for this student',
        data: []
      };
    }

    // Apply filters if provided
    let filteredPlacements = placements;

    if (filters?.status) {
      console.log(`🔎 Filtering by status: ${filters.status}`);
      filteredPlacements = filteredPlacements.filter(p => p.status === filters.status);
    }

    if (filters?.facility_confirmation_status) {
      console.log(`🔎 Filtering by facility_confirmation_status: ${filters.facility_confirmation_status}`);
      filteredPlacements = filteredPlacements.filter(p => p.facility_confirmation_status === filters.facility_confirmation_status);
    }

    console.log(`✅ Returning ${filteredPlacements.length} placements after filtering`);

    // Format response with placement slot details
    const formattedData = filteredPlacements.map(placement => ({
      assignment_id: placement.assignment_id,
      student_id: placement.student_id,
      placementslot_id: placement.placementslot_id,
      status: placement.status,
      facility_confirmation_status: placement.facility_confirmation_status,
      start_date: placement.start_date,
      end_date: placement.end_date,
      notes: placement.notes,
      created_at: placement.created_at,
      updated_at: placement.updated_at,
      placementSlot: placement.placementSlot ? {
        placementslot_id: placement.placementSlot.placementslot_id,
        facility_id: placement.placementSlot.facility_id,
        placementslot_type: placement.placementSlot.placementslot_type,
        course_applicable: placement.placementSlot.course_applicable,
        total_slots_offered: placement.placementSlot.total_slots_offered,
        remaining_seats: placement.placementSlot.remaining_seats,
        placement_start_date: placement.placementSlot.placement_start_date,
        placement_end_date: placement.placementSlot.placement_end_date,
        total_hours_required: placement.placementSlot.total_hours_required,
        shift_type: placement.placementSlot.shift_type,
        shift_timings: placement.placementSlot.shift_timings,
        working_days: placement.placementSlot.working_days
      } : null
    }));

    return {
      success: true,
      message: 'Student placements retrieved successfully',
      data: formattedData
    };
  } catch (error) {
    console.error(`❌ Error fetching placements for student ${studentId}:`, error);
    throw error;
  }
};

export default {
  create,
  createExternalStudent,
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
  getWithUserDetails,
  getStudentsList,
  addFacilityRecord,
  addAddressChangeRequest,
  addJobStatusUpdate,
  addSelfPlacement,
  updateAddressChangeRequest,
  updateJobStatusUpdate,
  updateSelfPlacement,
  bulkUpload,
  generateTemplate,
  getStudentPlacements,
  getStudentFacilities
  // activate and deactivate removed - use generic activation API instead:
  // PATCH /api/students/{id}/activate?activate={true|false}
};
