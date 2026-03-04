import { getRepository, getConnection, EntityManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';
import { FacilityAgreement } from '../../entities/facility/facility-agreement.entity';
import { File, EntityType, DocumentType } from '../../entities/file/file.entity';
import { StringError } from '../../errors/string.error';

/**
 * Upload a document file and create file record within transaction
 */
const uploadDocument = async (
  file: Express.Multer.File,
  agreementId: number,
  docType: DocumentType,
  manager: EntityManager
): Promise<string> => {
  // Generate folder path
  const folderPath = path.join('uploads', 'facility-agreements', agreementId.toString());

  // Ensure directory exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true, mode: 0o755 });
  }

  // Generate secure filename
  const ext = path.extname(file.originalname).toLowerCase();
  const timestamp = Date.now();
  const filename = `${docType}_${timestamp}${ext}`;
  const fullPath = path.join(folderPath, filename);

  // Move file from temp location
  fs.renameSync(file.path, fullPath);
  fs.chmodSync(fullPath, 0o644);

  // Create file record within the transaction
  const fileRecord = new File();
  fileRecord.entity_type = EntityType.AGREEMENT;
  fileRecord.entity_id = agreementId;
  fileRecord.doc_type = docType;
  fileRecord.file_path = fullPath.replace(/\\/g, '/');
  fileRecord.file_name = file.originalname;
  fileRecord.mime_type = file.mimetype;
  fileRecord.file_size = file.size;
  fileRecord.version = 1;
  fileRecord.expiry_date = null;

  await manager.save(fileRecord);

  console.log(`✅ Document uploaded: ${fullPath}`);

  return fullPath.replace(/\\/g, '/');
};

/**
 * Cleanup document on rollback
 */
const cleanupDocument = (filePath: string) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Cleaned up document file: ${filePath}`);
    }
  } catch (error) {
    console.error('❌ Failed to cleanup document file:', error);
  }
};

const create = async (params: ICreateFacilityAgreement, files?: IAgreementFiles) => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  let mouDocumentPath: string | null = null;
  let insuranceDocPath: string | null = null;

  try {
    const agreement = new FacilityAgreement();
    agreement.facility_id = params.facility_id;
    agreement.sent_students = params.sent_students;
    agreement.with_mou = params.with_mou;
    agreement.no_mou_but_taken = params.no_mou_but_taken;
    agreement.mou_exists_no_spot = params.mou_exists_no_spot;
    agreement.total_students = params.total_students;
    agreement.last_placement = params.last_placement;
    agreement.has_mou = params.has_mou;
    agreement.signed_on = params.signed_on;
    agreement.expiry_date = params.expiry_date;
    agreement.company_name = params.company_name;
    agreement.payment_required = params.payment_required;
    agreement.amount_per_spot = params.amount_per_spot;
    agreement.payment_notes = params.payment_notes;
    agreement.mou_document = params.mou_document;
    agreement.insurance_doc = params.insurance_doc;

    const savedAgreement = await queryRunner.manager.save(agreement);

    // Upload MOU document if provided
    if (files?.mou_document) {
      mouDocumentPath = await uploadDocument(
        files.mou_document,
        savedAgreement.agreement_id,
        DocumentType.MOU_DOCUMENT,
        queryRunner.manager
      );

      // Update agreement with document path
      await queryRunner.manager.update(FacilityAgreement, { agreement_id: savedAgreement.agreement_id }, {
        mou_document: mouDocumentPath
      });
    }

    // Upload insurance document if provided
    if (files?.insurance_doc) {
      insuranceDocPath = await uploadDocument(
        files.insurance_doc,
        savedAgreement.agreement_id,
        DocumentType.INSURANCE_DOCUMENT,
        queryRunner.manager
      );

      // Update agreement with document path
      await queryRunner.manager.update(FacilityAgreement, { agreement_id: savedAgreement.agreement_id }, {
        insurance_doc: insuranceDocPath
      });
    }

    await queryRunner.commitTransaction();

    return await getById(savedAgreement.agreement_id);

  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error('❌ Transaction failed, rolling back all changes:', error);

    // Cleanup uploaded files if they were moved
    if (mouDocumentPath) {
      cleanupDocument(mouDocumentPath);
    }
    if (insuranceDocPath) {
      cleanupDocument(insuranceDocPath);
    }

    throw error;
  } finally {
    await queryRunner.release();
  }
};

const getByFacilityId = async (facilityId: number) => {
  return await getRepository(FacilityAgreement).find({
    where: { facility_id: facilityId, isDeleted: false }
  });
};

const getById = async (id: number) => {
  return await getRepository(FacilityAgreement).findOne({
    where: { agreement_id: id, isDeleted: false }
  });
};

const update = async (params: IUpdateFacilityAgreement, files?: IAgreementFiles) => {
  const agreement = await getById(params.id);
  if (!agreement) {
    throw new StringError('Agreement does not exist');
  }

  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  let mouDocumentPath: string | null = null;
  let insuranceDocPath: string | null = null;

  try {
    const { id, ...updateData } = params;

    // Upload MOU document if provided
    if (files?.mou_document) {
      mouDocumentPath = await uploadDocument(
        files.mou_document,
        id,
        DocumentType.MOU_DOCUMENT,
        queryRunner.manager
      );
      updateData.mou_document = mouDocumentPath;
    }

    // Upload insurance document if provided
    if (files?.insurance_doc) {
      insuranceDocPath = await uploadDocument(
        files.insurance_doc,
        id,
        DocumentType.INSURANCE_DOCUMENT,
        queryRunner.manager
      );
      updateData.insurance_doc = insuranceDocPath;
    }

    await queryRunner.manager.update(
      FacilityAgreement,
      { agreement_id: id },
      { ...updateData, updatedAt: new Date() }
    );

    await queryRunner.commitTransaction();

    return await getById(id);

  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    console.error('❌ Update transaction failed, rolling back all changes:', error);

    // Cleanup uploaded files if they were moved
    if (mouDocumentPath) {
      cleanupDocument(mouDocumentPath);
    }
    if (insuranceDocPath) {
      cleanupDocument(insuranceDocPath);
    }

    throw error;
  } finally {
    await queryRunner.release();
  }
};

const remove = async (id: number) => {
  await getRepository(FacilityAgreement).update(
    { agreement_id: id },
    { isDeleted: true, updatedAt: new Date() }
  );
};

export interface IAgreementFiles {
  mou_document?: Express.Multer.File;
  insurance_doc?: Express.Multer.File;
}

export interface ICreateFacilityAgreement {
  facility_id: number;
  sent_students?: boolean;
  with_mou?: boolean;
  no_mou_but_taken?: boolean;
  mou_exists_no_spot?: boolean;
  total_students?: number;
  last_placement?: Date;
  has_mou?: boolean;
  signed_on?: Date;
  expiry_date?: Date;
  company_name?: string[];
  payment_required?: boolean;
  amount_per_spot?: number;
  payment_notes?: string;
  mou_document?: string;
  insurance_doc?: string;
}

export interface IUpdateFacilityAgreement extends Partial<ICreateFacilityAgreement> {
  id: number;
}

export default {
  create,
  getByFacilityId,
  getById,
  update,
  remove
};
