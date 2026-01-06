import { getRepository, QueryRunner } from 'typeorm';

// Entities
import { ContactDetails } from '../../entities/student/contact-details.entity';
import { VisaDetails } from '../../entities/student/visa-details.entity';
import { Address } from '../../entities/student/address.entity';
import { EligibilityStatus } from '../../entities/student/eligibility-status.entity';
import { StudentLifestyle } from '../../entities/student/student-lifestyle.entity';
import { PlacementPreferences } from '../../entities/student/placement-preferences.entity';
import { FacilityRecords } from '../../entities/student/facility-records.entity';
import { AddressChangeRequest } from '../../entities/student/address-change-request.entity';
import { JobStatusUpdate } from '../../entities/student/job-status-update.entity';

/**
 * Student Related Entities Service
 * Handles creation and management of student-related entities
 * Follows DRY principle by centralizing repetitive entity operations
 */
export default class StudentRelatedService {
  /**
   * Create contact details for a student
   */
  static async createContactDetails(
    studentId: number,
    data: any,
    queryRunner?: QueryRunner
  ): Promise<ContactDetails> {
    const contactData = {
      ...data,
      student: { student_id: studentId }
    };

    const repository = queryRunner 
      ? queryRunner.manager.getRepository(ContactDetails)
      : getRepository(ContactDetails);

    const result = await repository.save(contactData);
    console.log('✅ Contact details created');
    return result;
  }

  /**
   * Create visa details for a student
   */
  static async createVisaDetails(
    studentId: number,
    data: any,
    queryRunner?: QueryRunner
  ): Promise<VisaDetails> {
    const visaData = {
      ...data,
      student: { student_id: studentId }
    };

    const repository = queryRunner
      ? queryRunner.manager.getRepository(VisaDetails)
      : getRepository(VisaDetails);

    const result = await repository.save(visaData);
    console.log('✅ Visa details created');
    return result;
  }

  /**
   * Create addresses for a student
   */
  static async createAddresses(
    studentId: number,
    addresses: any[],
    queryRunner?: QueryRunner
  ): Promise<Address[]> {
    if (!addresses || addresses.length === 0) {
      return [];
    }

    const repository = queryRunner
      ? queryRunner.manager.getRepository(Address)
      : getRepository(Address);

    const results: Address[] = [];
    for (const addressData of addresses) {
      const result = await repository.save({
        ...addressData,
        student: { student_id: studentId }
      });
      results.push(result);
    }

    console.log(`✅ ${results.length} address(es) created`);
    return results;
  }

  /**
   * Create eligibility status for a student
   */
  static async createEligibilityStatus(
    studentId: number,
    data: any,
    queryRunner?: QueryRunner
  ): Promise<EligibilityStatus> {
    const eligibilityData = {
      ...data,
      student: { student_id: studentId }
    };

    const repository = queryRunner
      ? queryRunner.manager.getRepository(EligibilityStatus)
      : getRepository(EligibilityStatus);

    const result = await repository.save(eligibilityData);
    console.log('✅ Eligibility status created');
    return result;
  }

  /**
   * Create student lifestyle for a student
   */
  static async createStudentLifestyle(
    studentId: number,
    data: any,
    queryRunner?: QueryRunner
  ): Promise<StudentLifestyle> {
    const lifestyleData = {
      ...data,
      student: { student_id: studentId }
    };

    const repository = queryRunner
      ? queryRunner.manager.getRepository(StudentLifestyle)
      : getRepository(StudentLifestyle);

    const result = await repository.save(lifestyleData);
    console.log('✅ Student lifestyle created');
    return result;
  }

  /**
   * Create placement preferences for a student
   */
  static async createPlacementPreferences(
    studentId: number,
    data: any,
    queryRunner?: QueryRunner
  ): Promise<PlacementPreferences> {
    const placementData = {
      ...data,
      student: { student_id: studentId }
    };

    const repository = queryRunner
      ? queryRunner.manager.getRepository(PlacementPreferences)
      : getRepository(PlacementPreferences);

    const result = await repository.save(placementData);
    console.log('✅ Placement preferences created');
    return result;
  }

  /**
   * Create facility records for a student
   */
  static async createFacilityRecords(
    studentId: number,
    records: any[],
    queryRunner?: QueryRunner
  ): Promise<FacilityRecords[]> {
    if (!records || records.length === 0) {
      return [];
    }

    const repository = queryRunner
      ? queryRunner.manager.getRepository(FacilityRecords)
      : getRepository(FacilityRecords);

    const results: FacilityRecords[] = [];
    for (const recordData of records) {
      const result = await repository.save({
        ...recordData,
        student: { student_id: studentId }
      });
      results.push(result);
    }

    console.log(`✅ ${results.length} facility record(s) created`);
    return results;
  }

  /**
   * Create address change requests for a student
   */
  static async createAddressChangeRequests(
    studentId: number,
    requests: any[],
    queryRunner?: QueryRunner
  ): Promise<AddressChangeRequest[]> {
    if (!requests || requests.length === 0) {
      return [];
    }

    const repository = queryRunner
      ? queryRunner.manager.getRepository(AddressChangeRequest)
      : getRepository(AddressChangeRequest);

    const results: AddressChangeRequest[] = [];
    for (const requestData of requests) {
      const result = await repository.save({
        ...requestData,
        student: { student_id: studentId }
      });
      results.push(result);
    }

    console.log(`✅ ${results.length} address change request(s) created`);
    return results;
  }

  /**
   * Create job status updates for a student
   */
  static async createJobStatusUpdates(
    studentId: number,
    updates: any[],
    queryRunner?: QueryRunner
  ): Promise<JobStatusUpdate[]> {
    if (!updates || updates.length === 0) {
      return [];
    }

    const repository = queryRunner
      ? queryRunner.manager.getRepository(JobStatusUpdate)
      : getRepository(JobStatusUpdate);

    const results: JobStatusUpdate[] = [];
    for (const updateData of updates) {
      const result = await repository.save({
        ...updateData,
        student: { student_id: studentId }
      });
      results.push(result);
    }

    console.log(`✅ ${results.length} job status update(s) created`);
    return results;
  }

  /**
   * Create all related entities for a student
   * Centralized method to handle all related entity creation
   */
  static async createAllRelatedEntities(
    studentId: number,
    data: any,
    queryRunner?: QueryRunner
  ): Promise<void> {
    // Create contact details
    if (data.contact_details) {
      await this.createContactDetails(studentId, data.contact_details, queryRunner);
    }

    // Create visa details
    if (data.visa_details) {
      await this.createVisaDetails(studentId, data.visa_details, queryRunner);
    }

    // Create addresses
    if (data.addresses) {
      await this.createAddresses(studentId, data.addresses, queryRunner);
    }

    // Create eligibility status
    if (data.eligibility_status) {
      await this.createEligibilityStatus(studentId, data.eligibility_status, queryRunner);
    }

    // Create student lifestyle
    if (data.student_lifestyle) {
      await this.createStudentLifestyle(studentId, data.student_lifestyle, queryRunner);
    }

    // Create placement preferences
    if (data.placement_preferences) {
      await this.createPlacementPreferences(studentId, data.placement_preferences, queryRunner);
    }

    // Create facility records
    if (data.facility_records) {
      await this.createFacilityRecords(studentId, data.facility_records, queryRunner);
    }

    // Create address change requests
    if (data.address_change_requests) {
      await this.createAddressChangeRequests(studentId, data.address_change_requests, queryRunner);
    }

    // Create job status updates
    if (data.job_status_updates) {
      await this.createJobStatusUpdates(studentId, data.job_status_updates, queryRunner);
    }
  }
}
