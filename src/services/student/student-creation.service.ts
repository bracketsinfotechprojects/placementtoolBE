import { QueryRunner } from 'typeorm';
import { Student } from '../../entities/student/student.entity';
import { ContactDetails } from '../../entities/student/contact-details.entity';
import { VisaDetails } from '../../entities/student/visa-details.entity';
import { Address } from '../../entities/student/address.entity';
import { EligibilityStatus } from '../../entities/student/eligibility-status.entity';
import { StudentLifestyle } from '../../entities/student/student-lifestyle.entity';
import { PlacementPreferences } from '../../entities/student/placement-preferences.entity';
import { User } from '../../entities/user/user.entity';
import RoleService from '../role/role.service';
import PasswordUtility from '../../utilities/password.utility';
import TransactionUtility from '../../utilities/transaction.utility';
import ApiUtility from '../../utilities/api.utility';
import {
  ICreateStudent,
  ICreateExternalStudent,
  ICreateContactDetails,
  ICreateVisaDetails,
  ICreateAddress,
  ICreateEligibilityStatus,
  ICreateStudentLifestyle,
  ICreatePlacementPreferences
} from './student.interfaces';

/**
 * Student Creation Service
 * Handles all student creation operations including related entities
 */
class StudentCreationService {
  /**
   * Create student with all related entities and user account
   */
  async create(params: ICreateStudent) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      console.log('🚀 Starting student creation with transaction...');

      const student = await this.createStudentRecord(queryRunner, params);
      await this.createRelatedEntities(queryRunner, student, params);
      await this.createUserAccount(queryRunner, student, params);

      console.log('🎉 Student creation transaction committed successfully!');
      return ApiUtility.sanitizeStudent(student);
    });
  }

  /**
   * Create external student (no user account, limited tables)
   */
  async createExternal(params: ICreateExternalStudent) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      console.log('🚀 Starting EXTERNAL student creation with transaction...');

      const student = await this.createStudentRecord(queryRunner, params);
      await this.createBasicEntities(queryRunner, student, params);

      console.log('🎉 External Student creation transaction committed successfully!');
      return ApiUtility.sanitizeStudent(student);
    });
  }

  /**
   * Create main student record with location
   */
  private async createStudentRecord(queryRunner: QueryRunner, params: ICreateStudent | ICreateExternalStudent): Promise<Student> {
    const student = new Student();
    student.first_name = params.first_name;
    student.last_name = params.last_name;
    student.dob = params.dob;
    student.gender = params.gender;
    student.nationality = params.nationality;
    student.student_type = params.student_type || 'domestic';
    student.status = params.status || 'active';

    const tempStudent = await queryRunner.manager.save(Student, student);
    const studentId = tempStudent.student_id;

    // Set location (default to POINT(0, 0) if not provided)
    const longitude = params.longitude ?? 0;
    const latitude = params.latitude ?? 0;
    
    await queryRunner.manager.query(
      `UPDATE students SET location = POINT(?, ?) WHERE student_id = ?`,
      [longitude, latitude, studentId]
    );

    const studentData = await queryRunner.manager.findOne(Student, { where: { student_id: studentId } });
    console.log('✅ Student record created with ID:', studentData.student_id);
    
    return studentData;
  }

  /**
   * Create all related entities for full student
   */
  private async createRelatedEntities(queryRunner: QueryRunner, student: Student, params: ICreateStudent) {
    await this.createContactDetails(queryRunner, student, params.contact_details, params.email);
    await this.createVisaDetails(queryRunner, student, params.visa_details);
    await this.createAddresses(queryRunner, student, params.addresses);
    await this.createEligibilityStatus(queryRunner, student, params.eligibility_status);
    await this.createStudentLifestyle(queryRunner, student, params.student_lifestyle);
    await this.createPlacementPreferences(queryRunner, student, params.placement_preferences);
  }

  /**
   * Create basic entities for external student
   */
  private async createBasicEntities(queryRunner: QueryRunner, student: Student, params: ICreateExternalStudent) {
    await this.createContactDetails(queryRunner, student, params.contact_details);
    await this.createVisaDetails(queryRunner, student, params.visa_details);
    await this.createAddresses(queryRunner, student, params.addresses);
  }

  /**
   * Create contact details
   */
  private async createContactDetails(queryRunner: QueryRunner, student: Student, data?: ICreateContactDetails, fallbackEmail?: string) {
    if (!data) return;

    try {
      const contactDetails = new ContactDetails();
      contactDetails.student = student;
      contactDetails.primary_mobile = data.primary_mobile;
      contactDetails.email = data.email || fallbackEmail;
      contactDetails.alternate_contact = data.alternate_contact;
      contactDetails.emergency_contact = data.emergency_contact;
      contactDetails.emergency_contact_name = data.emergency_contact_name;
      contactDetails.relationship = data.relationship;
      contactDetails.contact_type = data.contact_type || 'mobile';
      contactDetails.is_primary = data.is_primary !== undefined ? data.is_primary : true;
      contactDetails.verified_at = data.verified_at;

      await queryRunner.manager.save(ContactDetails, contactDetails);
      console.log('✅ Contact details created');
    } catch (error) {
      throw new Error(`Failed to create contact details: ${error.message}`);
    }
  }

  /**
   * Create visa details
   */
  private async createVisaDetails(queryRunner: QueryRunner, student: Student, data?: ICreateVisaDetails) {
    if (!data) return;

    try {
      const visaDetails = new VisaDetails();
      visaDetails.student = student;
      visaDetails.visa_type = data.visa_type;
      visaDetails.visa_number = data.visa_number;
      visaDetails.start_date = data.start_date;
      visaDetails.expiry_date = data.expiry_date;
      visaDetails.status = data.status || 'active';
      visaDetails.issuing_country = data.issuing_country;
      visaDetails.document_path = data.document_path;
      visaDetails.work_limitation = data.work_limitation;

      await queryRunner.manager.save(VisaDetails, visaDetails);
      console.log('✅ Visa details created');
    } catch (error) {
      throw new Error(`Failed to create visa details: ${error.message}`);
    }
  }

  /**
   * Create addresses
   */
  private async createAddresses(queryRunner: QueryRunner, student: Student, addresses?: ICreateAddress[]) {
    if (!addresses || addresses.length === 0) return;

    try {
      for (const addressData of addresses) {
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
      console.log(`✅ ${addresses.length} address(es) created`);
    } catch (error) {
      throw new Error(`Failed to create addresses: ${error.message}`);
    }
  }

  /**
   * Create eligibility status
   */
  private async createEligibilityStatus(queryRunner: QueryRunner, student: Student, data?: ICreateEligibilityStatus) {
    if (!data) return;

    try {
      const validStatuses = ['eligible', 'not_eligible', 'pending', 'override'];
      let overallStatus = data.overall_status?.trim() || 'not_eligible';

      if (!validStatuses.includes(overallStatus)) {
        console.warn(`⚠️ Invalid overall_status: "${overallStatus}". Using default: "not_eligible"`);
        overallStatus = 'not_eligible';
      }

      const eligibilityStatus = new EligibilityStatus();
      eligibilityStatus.student = student;
      eligibilityStatus.classes_completed = data.classes_completed;
      eligibilityStatus.fees_paid = data.fees_paid;
      eligibilityStatus.assignments_submitted = data.assignments_submitted;
      eligibilityStatus.documents_submitted = data.documents_submitted;
      eligibilityStatus.trainer_consent = data.trainer_consent;
      eligibilityStatus.override_requested = data.override_requested;
      eligibilityStatus.manual_override = data.manual_override || false;
      eligibilityStatus.manual_handling = data.manual_handling || false;
      eligibilityStatus.requested_by = data.requested_by;
      eligibilityStatus.reason = data.reason;
      eligibilityStatus.comments = data.comments;
      eligibilityStatus.overall_status = overallStatus as 'eligible' | 'not_eligible' | 'pending' | 'override';

      await queryRunner.manager.save(EligibilityStatus, eligibilityStatus);
      console.log('✅ Eligibility status created');
    } catch (error) {
      throw new Error(`Failed to create eligibility status: ${error.message}`);
    }
  }

  /**
   * Create student lifestyle
   */
  private async createStudentLifestyle(queryRunner: QueryRunner, student: Student, data?: ICreateStudentLifestyle) {
    if (!data) return;

    try {
      const lifestyle = new StudentLifestyle();
      lifestyle.student = student;
      lifestyle.currently_working = data.currently_working;
      lifestyle.working_hours = data.working_hours;
      lifestyle.has_dependents = data.has_dependents;
      lifestyle.married = data.married;
      lifestyle.driving_license = data.driving_license;
      lifestyle.own_vehicle = data.own_vehicle;
      lifestyle.public_transport_only = data.public_transport_only;
      lifestyle.can_travel_long_distance = data.can_travel_long_distance;
      lifestyle.drop_support_available = data.drop_support_available;
      lifestyle.fully_flexible = data.fully_flexible;
      lifestyle.rush_placement_required = data.rush_placement_required;
      lifestyle.preferred_days = data.preferred_days;
      lifestyle.preferred_time_slots = data.preferred_time_slots;
      lifestyle.additional_notes = data.additional_notes;

      await queryRunner.manager.save(StudentLifestyle, lifestyle);
      console.log('✅ Student lifestyle created');
    } catch (error) {
      throw new Error(`Failed to create student lifestyle: ${error.message}`);
    }
  }

  /**
   * Create placement preferences
   */
  private async createPlacementPreferences(queryRunner: QueryRunner, student: Student, data?: ICreatePlacementPreferences) {
    if (!data) return;

    try {
      const validUrgencyLevels = ['immediate', 'within_month', 'within_quarter', 'flexible'];
      const urgencyLevel = data.urgency_level?.toLowerCase().trim();
      
      if (urgencyLevel && !validUrgencyLevels.includes(urgencyLevel)) {
        throw new Error(`Invalid urgency_level: "${data.urgency_level}". Must be one of: ${validUrgencyLevels.join(', ')}`);
      }

      const preferences = new PlacementPreferences();
      preferences.student = student;
      preferences.preferred_states = data.preferred_states;
      preferences.preferred_cities = data.preferred_cities;
      preferences.max_travel_distance_km = data.max_travel_distance_km;
      preferences.morning_only = data.morning_only;
      preferences.evening_only = data.evening_only;
      preferences.night_shift = data.night_shift;
      preferences.weekend_only = data.weekend_only;
      preferences.part_time = data.part_time;
      preferences.full_time = data.full_time;
      preferences.with_friend = data.with_friend;
      preferences.friend_name_or_id = data.friend_name_or_id;
      preferences.with_spouse = data.with_spouse;
      preferences.spouse_name_or_id = data.spouse_name_or_id;
      preferences.earliest_start_date = data.earliest_start_date;
      preferences.latest_start_date = data.latest_start_date;
      preferences.specific_month_preference = data.specific_month_preference;
      preferences.urgency_level = (urgencyLevel as any) || 'flexible';
      preferences.additional_preferences = data.additional_preferences;

      await queryRunner.manager.save(PlacementPreferences, preferences);
      console.log('✅ Placement preferences created');
    } catch (error) {
      throw new Error(`Failed to create placement preferences: ${error.message}`);
    }
  }

  /**
   * Create user account for student
   */
  private async createUserAccount(queryRunner: QueryRunner, student: Student, params: ICreateStudent) {
    const email = params.email || params.login?.email;
    const password = params.password || params.login?.password;
    const userStatus = params.login?.status || 'active';

    if (!email || !password) {
      console.log('ℹ️ Email or password not provided - user account NOT created');
      return;
    }

    try {
      const hashedPassword = await PasswordUtility.hashPassword(password);
      const roleId = await RoleService.getRoleIdByName('Student');

      const user = new User();
      user.loginID = email;
      user.password = hashedPassword;
      user.roleID = roleId;
      user.studentID = student.student_id;
      user.facilityID = null;
      user.supervisorID = null;
      user.placementExecutiveID = null;
      user.trainerID = null;
      user.status = userStatus;

      await queryRunner.manager.save(User, user);
      console.log('✅ User account created successfully');
    } catch (error) {
      throw new Error(`Failed to create user account: ${error.message}`);
    }
  }
}

export default new StudentCreationService();
