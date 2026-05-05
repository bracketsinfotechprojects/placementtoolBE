import { getConnection, EntityManager } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Facility } from '../../entities/facility/facility.entity';
import { FacilityAttribute } from '../../entities/facility/facility-attribute.entity';
import { FacilityOrganizationStructure } from '../../entities/facility/facility-organization-structure.entity';
import { FacilityBranchSite } from '../../entities/facility/facility-branch-site.entity';
import { FacilityAgreement } from '../../entities/facility/facility-agreement.entity';
import { FacilityDocumentRequired } from '../../entities/facility/facility-document-required.entity';
import { FacilityRule } from '../../entities/facility/facility-rule.entity';
import { User } from '../../entities/user/user.entity';
import { File, EntityType, DocumentType } from '../../entities/file/file.entity';
import FacilityRepository from '../../repositories/facility.repository';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import { ICreateFacility, IAgreementFiles } from './facility.interfaces';

/**
 * Facility Creation Service
 * Handles facility creation with all related entities
 */
class FacilityCreationService {
  /**
   * Upload document file and create file record within transaction
   */
  private async uploadDocument(
    file: Express.Multer.File,
    agreementId: number,
    docType: DocumentType,
    manager: EntityManager
  ): Promise<string> {
    const folderPath = path.join('uploads', 'facility-agreements', agreementId.toString());

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true, mode: 0o755 });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const filename = `${docType}_${timestamp}${ext}`;
    const fullPath = path.join(folderPath, filename);

    fs.renameSync(file.path, fullPath);
    fs.chmodSync(fullPath, 0o644);

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

    return fullPath.replace(/\\/g, '/');
  }

  /**
   * Create facility with all related entities
   */
  async create(params: ICreateFacility, agreementFiles?: Map<number, IAgreementFiles>) {
    if (!params.organization_name) {
      throw new Error('organization_name is required');
    }

    let email = params.email;
    let password = params.password;

    if (params.login) {
      email = params.login.email;
      password = params.login.password;
    }

    if (email && !password) {
      throw new Error('password is required when email is provided');
    }
    if (password && !email) {
      throw new Error('email is required when password is provided');
    }

    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const facility = await this.createFacilityRecord(queryRunner, params);
      const facilityId = facility.facility_id;

      await this.createUserAccount(queryRunner, facilityId, email, password);
      await this.createAttributes(queryRunner, facilityId, params.attributes);
      await this.createOrganizationStructures(queryRunner, facilityId, params.organization_structures);
      await this.createBranches(queryRunner, facilityId, params.branches);
      await this.createAgreements(queryRunner, facilityId, params.agreements, agreementFiles);
      await this.createDocumentsRequired(queryRunner, facilityId, params.documents_required);
      await this.createRules(queryRunner, facilityId, params.rules);

      await queryRunner.commitTransaction();

      return await FacilityRepository.findByIdWithRelations(facilityId);
    } catch (error) {
      try {
        await queryRunner.rollbackTransaction();
      } catch (rollbackError) {
        console.error('⚠️ Rollback error:', rollbackError);
      }
      console.error('❌ Transaction failed:', error);
      throw error;
    } finally {
      try {
        await queryRunner.release();
      } catch (releaseError) {
        console.error('⚠️ Release error:', releaseError);
      }
    }
  }

  /**
   * Create main facility record with location
   */
  private async createFacilityRecord(queryRunner: any, params: ICreateFacility): Promise<Facility> {
    const facility = new Facility();
    facility.organization_name = params.organization_name;
    facility.registered_business_name = params.registered_business_name;
    facility.website_url = params.website_url;
    facility.abn_registration_number = params.abn_registration_number;
    facility.source_of_data = params.source_of_data;
    facility.states_covered = params.states_covered || [];
    facility.categories = params.categories || [];

    const tempFacility = await queryRunner.manager.save(facility);
    const facilityId = tempFacility.facility_id;

    const longitude = params.longitude ?? 0;
    const latitude = params.latitude ?? 0;

    await queryRunner.manager.query(
      `UPDATE facility SET location = POINT(?, ?) WHERE facility_id = ?`,
      [longitude, latitude, facilityId]
    );

    return await queryRunner.manager.findOne(Facility, { where: { facility_id: facilityId } });
  }

  /**
   * Create user account for facility
   */
  private async createUserAccount(queryRunner: any, facilityId: number, email?: string, password?: string) {
    if (!email || !password) return;

    const existingUser = await queryRunner.manager.findOne(User, {
      where: { loginID: email }
    });

    if (existingUser) {
      throw new Error(`Email '${email}' already exists`);
    }

    const facilityRoleId = await RoleService.getRoleIdByName('Facility');

    const user = new User();
    user.loginID = email;
    user.password = await PasswordUtility.hashPassword(password);
    user.roleID = facilityRoleId;
    user.facilityID = facilityId;
    user.studentID = null;
    user.status = 'active';

    await queryRunner.manager.save(user);
    console.log(`✅ Created facility user account with facilityID=${facilityId}`);
  }

  /**
   * Create facility attributes
   */
  private async createAttributes(queryRunner: any, facilityId: number, attributes?: any[]) {
    if (!attributes || attributes.length === 0) return;

    const facilityAttrs = attributes.map(attr => {
      const facilityAttr = new FacilityAttribute();
      facilityAttr.facility_id = facilityId;
      facilityAttr.attribute_type = attr.attribute_type;
      facilityAttr.attribute_value = attr.attribute_value;
      return facilityAttr;
    });

    await queryRunner.manager.save(facilityAttrs);
  }

  /**
   * Create organization structures
   */
  private async createOrganizationStructures(queryRunner: any, facilityId: number, structures?: any[]) {
    if (!structures || structures.length === 0) return;

    const orgStructures = structures.map(org => {
      const orgStruct = new FacilityOrganizationStructure();
      orgStruct.facility_id = facilityId;
      Object.assign(orgStruct, org);
      return orgStruct;
    });

    await queryRunner.manager.save(orgStructures);
  }

  /**
   * Create branches
   */
  private async createBranches(queryRunner: any, facilityId: number, branches?: any[]) {
    if (!branches || branches.length === 0) return;

    const branchSites = branches.map(branch => {
      const branchSite = new FacilityBranchSite();
      branchSite.facility_id = facilityId;
      Object.assign(branchSite, {
        ...branch,
        palliative_care: branch.palliative_care || false,
        dementia_care: branch.dementia_care || false
      });
      return branchSite;
    });

    await queryRunner.manager.save(branchSites);
  }

  /**
   * Create agreements with file uploads
   */
  private async createAgreements(
    queryRunner: any,
    facilityId: number,
    agreements?: any[],
    agreementFiles?: Map<number, IAgreementFiles>
  ) {
    if (!agreements || agreements.length === 0) return;

    for (let i = 0; i < agreements.length; i++) {
      const agr = agreements[i];
      const agreement = new FacilityAgreement();
      agreement.facility_id = facilityId;
      Object.assign(agreement, {
        ...agr,
        company_name: agr.company_name
          ? (Array.isArray(agr.company_name) ? agr.company_name : [agr.company_name])
          : agr.company_name
      });

      const savedAgreement = await queryRunner.manager.save(agreement);

      if (agreementFiles && agreementFiles.has(i)) {
        const files = agreementFiles.get(i)!;

        if (files.mou_document) {
          const mouPath = await this.uploadDocument(
            files.mou_document,
            savedAgreement.agreement_id,
            DocumentType.MOU_DOCUMENT,
            queryRunner.manager
          );
          await queryRunner.manager.update(FacilityAgreement, { agreement_id: savedAgreement.agreement_id }, {
            mou_document: mouPath
          });
        }

        if (files.insurance_doc) {
          const insurancePath = await this.uploadDocument(
            files.insurance_doc,
            savedAgreement.agreement_id,
            DocumentType.INSURANCE_DOCUMENT,
            queryRunner.manager
          );
          await queryRunner.manager.update(FacilityAgreement, { agreement_id: savedAgreement.agreement_id }, {
            insurance_doc: insurancePath
          });
        }
      }
    }
  }

  /**
   * Create documents required
   */
  private async createDocumentsRequired(queryRunner: any, facilityId: number, documents?: any[]) {
    if (!documents || documents.length === 0) return;

    const docs = documents.map(doc => {
      const document = new FacilityDocumentRequired();
      document.facility_id = facilityId;
      Object.assign(document, doc);
      return document;
    });

    await queryRunner.manager.save(docs);
  }

  /**
   * Create facility rules
   */
  private async createRules(queryRunner: any, facilityId: number, rules?: any[]) {
    if (!rules || rules.length === 0) return;

    const facilityRules = rules.map(r => {
      const rule = new FacilityRule();
      rule.facility_id = facilityId;
      Object.assign(rule, r);
      return rule;
    });

    await queryRunner.manager.save(facilityRules);
  }
}

export default new FacilityCreationService();
