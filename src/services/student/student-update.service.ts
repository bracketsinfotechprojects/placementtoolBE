import { getRepository, In } from 'typeorm';
import { Student } from '../../entities/student/student.entity';
import { ContactDetails } from '../../entities/student/contact-details.entity';
import { VisaDetails } from '../../entities/student/visa-details.entity';
import { Address } from '../../entities/student/address.entity';
import { EligibilityStatus } from '../../entities/student/eligibility-status.entity';
import { StudentLifestyle } from '../../entities/student/student-lifestyle.entity';
import { PlacementPreferences } from '../../entities/student/placement-preferences.entity';
import TransactionUtility from '../../utilities/transaction.utility';
import ApiUtility from '../../utilities/api.utility';
import { StringError } from '../../errors/string.error';
import { IDeleteById } from '../../interfaces/common.interface';
import { IUpdateStudent, IBulkUpdateStatus } from './student.interfaces';

const baseWhere = { isDeleted: false };

/**
 * Student Update Service
 * Handles all update and delete operations for students
 */
class StudentUpdateService {
  /**
   * Update student with all related entities
   */
  async update(params: IUpdateStudent) {
    return await TransactionUtility.executeInTransaction(async (queryRunner) => {
      const query = { ...baseWhere, student_id: params.student_id };

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

      // Update main student fields
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
      }

      // Update location if provided
      if (params.latitude !== undefined && params.longitude !== undefined) {
        await queryRunner.manager.query(
          `UPDATE students SET location = POINT(?, ?) WHERE student_id = ?`,
          [params.longitude, params.latitude, params.student_id]
        );
      }

      // Update related entities
      await this.updateContactDetails(queryRunner, student, params);
      await this.updateVisaDetails(queryRunner, student, params);
      await this.updateAddresses(queryRunner, student, params);
      await this.updateEligibilityStatus(queryRunner, student, params);
      await this.updateStudentLifestyle(queryRunner, student, params);
      await this.updatePlacementPreferences(queryRunner, student, params);

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
  }

  /**
   * Soft delete student
   */
  async remove(params: IDeleteById) {
    const query = { ...baseWhere, student_id: params.id };

    const student = await getRepository(Student).findOne(query);
    if (!student) {
      throw new StringError('Student does not exist');
    }

    return await getRepository(Student).update(query, {
      isDeleted: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Permanently delete student
   */
  async permanentlyDelete(params: IDeleteById) {
    const query = { student_id: params.id };

    const student = await getRepository(Student).findOne(query);
    if (!student) {
      throw new StringError('Student does not exist');
    }

    await getRepository(Student).delete(query);
    return { success: true };
  }

  /**
   * Bulk update student status
   */
  async bulkUpdateStatus(student_ids: number[], status: 'active' | 'inactive' | 'graduated' | 'withdrawn') {
    await getRepository(Student).update(
      { student_id: In(student_ids) },
      { status, updatedAt: new Date() }
    );
    return { success: true };
  }

  // Private helper methods
  private async updateContactDetails(queryRunner: any, student: Student, params: IUpdateStudent) {
    if (!params.contact_details) return;

    try {
      if (student.contact_details && student.contact_details.length > 0) {
        await queryRunner.manager.delete(ContactDetails, {
          student: { student_id: params.student_id }
        });
      }

      const contactDetails = new ContactDetails();
      contactDetails.student = student;
      Object.assign(contactDetails, {
        ...params.contact_details,
        contact_type: params.contact_details.contact_type || 'mobile',
        is_primary: params.contact_details.is_primary !== undefined ? params.contact_details.is_primary : true
      });

      await queryRunner.manager.save(ContactDetails, contactDetails);
    } catch (error) {
      throw new Error(`Failed to update contact details: ${error.message}`);
    }
  }

  private async updateVisaDetails(queryRunner: any, student: Student, params: IUpdateStudent) {
    if (!params.visa_details) return;

    try {
      if (student.visa_details && student.visa_details.length > 0) {
        await queryRunner.manager.delete(VisaDetails, {
          student: { student_id: params.student_id }
        });
      }

      const visaDetails = new VisaDetails();
      visaDetails.student = student;
      Object.assign(visaDetails, {
        ...params.visa_details,
        status: params.visa_details.status || 'active'
      });

      await queryRunner.manager.save(VisaDetails, visaDetails);
    } catch (error) {
      throw new Error(`Failed to update visa details: ${error.message}`);
    }
  }

  private async updateAddresses(queryRunner: any, student: Student, params: IUpdateStudent) {
    if (!params.addresses || params.addresses.length === 0) return;

    try {
      if (student.addresses && student.addresses.length > 0) {
        await queryRunner.manager.delete(Address, {
          student: { student_id: params.student_id }
        });
      }

      for (const addressData of params.addresses) {
        const address = new Address();
        address.student = student;
        Object.assign(address, {
          ...addressData,
          address_type: addressData.address_type || 'current',
          is_primary: addressData.is_primary || false
        });

        await queryRunner.manager.save(Address, address);
      }
    } catch (error) {
      throw new Error(`Failed to update addresses: ${error.message}`);
    }
  }

  private async updateEligibilityStatus(queryRunner: any, student: Student, params: IUpdateStudent) {
    if (!params.eligibility_status) return;

    try {
      if (student.eligibility_status && student.eligibility_status.length > 0) {
        await queryRunner.manager.delete(EligibilityStatus, {
          student: { student_id: params.student_id }
        });
      }

      const validStatuses = ['eligible', 'not_eligible', 'pending', 'override'];
      let overallStatus = params.eligibility_status.overall_status?.trim() || 'not_eligible';

      if (!validStatuses.includes(overallStatus)) {
        overallStatus = 'not_eligible';
      }

      const eligibilityStatus = new EligibilityStatus();
      eligibilityStatus.student = student;
      Object.assign(eligibilityStatus, {
        ...params.eligibility_status,
        manual_override: params.eligibility_status.manual_override || false,
        manual_handling: params.eligibility_status.manual_handling || false,
        overall_status: overallStatus as any
      });

      await queryRunner.manager.save(EligibilityStatus, eligibilityStatus);
    } catch (error) {
      throw new Error(`Failed to update eligibility status: ${error.message}`);
    }
  }

  private async updateStudentLifestyle(queryRunner: any, student: Student, params: IUpdateStudent) {
    if (!params.student_lifestyle) return;

    try {
      if (student.student_lifestyle && student.student_lifestyle.length > 0) {
        await queryRunner.manager.delete(StudentLifestyle, {
          student: { student_id: params.student_id }
        });
      }

      const lifestyle = new StudentLifestyle();
      lifestyle.student = student;
      Object.assign(lifestyle, params.student_lifestyle);

      await queryRunner.manager.save(StudentLifestyle, lifestyle);
    } catch (error) {
      throw new Error(`Failed to update student lifestyle: ${error.message}`);
    }
  }

  private async updatePlacementPreferences(queryRunner: any, student: Student, params: IUpdateStudent) {
    if (!params.placement_preferences) return;

    try {
      if (student.placement_preferences && student.placement_preferences.length > 0) {
        await queryRunner.manager.delete(PlacementPreferences, {
          student: { student_id: params.student_id }
        });
      }

      const validUrgencyLevels = ['immediate', 'within_month', 'within_quarter', 'flexible'];
      const urgencyLevel = params.placement_preferences.urgency_level?.toLowerCase().trim();

      if (urgencyLevel && !validUrgencyLevels.includes(urgencyLevel)) {
        throw new Error(`Invalid urgency_level: "${params.placement_preferences.urgency_level}"`);
      }

      const preferences = new PlacementPreferences();
      preferences.student = student;
      Object.assign(preferences, {
        ...params.placement_preferences,
        urgency_level: (urgencyLevel as any) || 'flexible'
      });

      await queryRunner.manager.save(PlacementPreferences, preferences);
    } catch (error) {
      throw new Error(`Failed to update placement preferences: ${error.message}`);
    }
  }
}

export default new StudentUpdateService();
