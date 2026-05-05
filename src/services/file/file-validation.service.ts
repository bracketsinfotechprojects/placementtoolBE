/**
 * File Validation Service
 * Handles file validation and entity verification
 */

import { getRepository } from 'typeorm';
import { EntityType } from '../../entities/file/file.entity';
import { Student } from '../../entities/student/student.entity';
import { Facility } from '../../entities/facility/facility.entity';
import { Trainer } from '../../entities/trainer/trainer.entity';
import { FacilitySupervisor } from '../../entities/facility-supervisor/facility-supervisor.entity';
import { PlacementExecutive } from '../../entities/placement-executive/placement-executive.entity';
import { FacilityAgreement } from '../../entities/facility/facility-agreement.entity';

class FileValidationService {
  /**
   * Validate that entity exists
   */
  async validateEntityExists(entityType: EntityType, entityId: number): Promise<void> {
    let exists = false;

    switch (entityType) {
      case EntityType.STUDENT:
        exists = !!(await getRepository(Student).findOne({ where: { student_id: entityId } }));
        break;
      case EntityType.FACILITY:
        exists = !!(await getRepository(Facility).findOne({ where: { facility_id: entityId } }));
        break;
      case EntityType.TRAINER:
        exists = !!(await getRepository(Trainer).findOne({ where: { trainer_id: entityId } }));
        break;
      case EntityType.FACILITY_SUPERVISOR:
        exists = !!(await getRepository(FacilitySupervisor).findOne({ where: { supervisor_id: entityId } }));
        break;
      case EntityType.PLACEMENT_EXECUTIVE:
        exists = !!(await getRepository(PlacementExecutive).findOne({ where: { placement_executive_id: entityId } }));
        break;
      case EntityType.AGREEMENT:
        exists = !!(await getRepository(FacilityAgreement).findOne({ where: { agreement_id: entityId } }));
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    if (!exists) {
      throw new Error(`${entityType} with ID ${entityId} does not exist`);
    }
  }

  /**
   * Validate file type
   */
  validateFileType(mimetype: string, originalname: string): void {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];

    const fileExtension = originalname.substring(originalname.lastIndexOf('.')).toLowerCase();

    if (!allowedMimeTypes.includes(mimetype) && !allowedExtensions.includes(fileExtension)) {
      throw new Error(
        `Invalid file type. Allowed types: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX. Received: ${mimetype} (${fileExtension})`
      );
    }
  }
}

export default new FileValidationService();
