import { Student } from '../../entities/student/student.entity';
import { FacilityRecords } from '../../entities/student/facility-records.entity';
import { AddressChangeRequest } from '../../entities/student/address-change-request.entity';
import { JobStatusUpdate } from '../../entities/student/job-status-update.entity';
import { SelfPlacement } from '../../entities/student/self-placement.entity';
import { Address } from '../../entities/student/address.entity';
import TransactionUtility from '../../utilities/transaction.utility';
import { StringError } from '../../errors/string.error';
import {
  ICreateFacilityRecords,
  ICreateAddressChangeRequest,
  ICreateJobStatusUpdate,
  ICreateSelfPlacement,
  IUpdateAddressChangeRequest,
  IUpdateJobStatusUpdate,
  IUpdateSelfPlacement
} from './student.interfaces';

/**
 * Student Records Service
 * Handles facility records, address changes, job status, and self-placements
 */
class StudentRecordsService {
  /**
   * Add facility record for student
   */
  async addFacilityRecord(studentId: number, facilityData: ICreateFacilityRecords) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const student = await queryRunner.manager.findOne(Student, {
        where: { student_id: studentId, isDeleted: false }
      });

      if (!student) {
        throw new StringError('Student not found');
      }

      const validStatuses = ['applied', 'under_review', 'accepted', 'rejected', 'confirmed', 'completed'];
      let applicationStatus = facilityData.application_status?.toLowerCase().trim() || 'applied';

      if (!validStatuses.includes(applicationStatus)) {
        throw new StringError(`Invalid application_status: "${facilityData.application_status}". Must be one of: ${validStatuses.join(', ')}`);
      }

      const facility = new FacilityRecords();
      facility.student = student;
      Object.assign(facility, {
        ...facilityData,
        application_status: applicationStatus as any
      });

      const savedFacility = await queryRunner.manager.save(FacilityRecords, facility);
      console.log('✅ Facility record added successfully');

      return savedFacility;
    });
  }

  /**
   * Add address change request
   */
  async addAddressChangeRequest(studentId: number, requestData: ICreateAddressChangeRequest) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const student = await queryRunner.manager.findOne(Student, {
        where: { student_id: studentId, isDeleted: false },
        relations: ['addresses']
      });

      if (!student) {
        throw new StringError('Student not found');
      }

      const changeRequestData = requestData.change_request || requestData;
      const hasDetailedAddress = requestData.line1 || requestData.city || requestData.state;

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
      }

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

      const savedRequest = await queryRunner.manager.save(AddressChangeRequest, request);

      if (hasDetailedAddress) {
        if (requestData.is_primary) {
          await queryRunner.manager.update(
            Address,
            { student: { student_id: studentId }, is_primary: true },
            { is_primary: false }
          );
        }

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

        const savedAddress = await queryRunner.manager.save(Address, newAddress);

        return {
          address_change_request: savedRequest,
          address_updated: true,
          new_address_id: savedAddress.address_id
        };
      }

      return savedRequest;
    });
  }

  /**
   * Add job status update
   */
  async addJobStatusUpdate(studentId: number, jobData: ICreateJobStatusUpdate) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const student = await queryRunner.manager.findOne(Student, {
        where: { student_id: studentId, isDeleted: false }
      });

      if (!student) {
        throw new StringError('Student not found');
      }

      const jobStatus = new JobStatusUpdate();
      jobStatus.student = student;
      Object.assign(jobStatus, jobData);

      const savedJobStatus = await queryRunner.manager.save(JobStatusUpdate, jobStatus);
      console.log('✅ Job status update added successfully');

      return savedJobStatus;
    });
  }

  /**
   * Add self placement
   */
  async addSelfPlacement(studentId: number, placementData: ICreateSelfPlacement) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const student = await queryRunner.manager.findOne(Student, {
        where: { student_id: studentId, isDeleted: false }
      });

      if (!student) {
        throw new StringError('Student not found');
      }

      const selfPlacement = new SelfPlacement();
      selfPlacement.student = student;
      Object.assign(selfPlacement, placementData);

      const savedPlacement = await queryRunner.manager.save(SelfPlacement, selfPlacement);
      console.log('✅ Self placement added successfully');

      return savedPlacement;
    });
  }

  /**
   * Update address change request
   */
  async updateAddressChangeRequest(params: IUpdateAddressChangeRequest) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const request = await queryRunner.manager.findOne(AddressChangeRequest, {
        where: { acr_id: params.acr_id }
      });

      if (!request) {
        throw new StringError('Address change request not found');
      }

      Object.assign(request, params);
      const updated = await queryRunner.manager.save(AddressChangeRequest, request);

      return updated;
    });
  }

  /**
   * Update job status update
   */
  async updateJobStatusUpdate(params: IUpdateJobStatusUpdate) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const jobStatus = await queryRunner.manager.findOne(JobStatusUpdate, {
        where: { jsu_id: params.jsu_id }
      });

      if (!jobStatus) {
        throw new StringError('Job status update not found');
      }

      Object.assign(jobStatus, params);
      const updated = await queryRunner.manager.save(JobStatusUpdate, jobStatus);

      return updated;
    });
  }

  /**
   * Update self placement
   */
  async updateSelfPlacement(params: IUpdateSelfPlacement) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const placement = await queryRunner.manager.findOne(SelfPlacement, {
        where: { sp_id: params.sp_id }
      });

      if (!placement) {
        throw new StringError('Self placement not found');
      }

      Object.assign(placement, params);
      const updated = await queryRunner.manager.save(SelfPlacement, placement);

      return updated;
    });
  }
}

export default new StudentRecordsService();
