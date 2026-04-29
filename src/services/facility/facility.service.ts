import { getRepository, getConnection, EntityManager, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';
import { Facility } from '../../entities/facility/facility.entity';
import { FacilityAttribute } from '../../entities/facility/facility-attribute.entity';
import { FacilityOrganizationStructure } from '../../entities/facility/facility-organization-structure.entity';
import { FacilityBranchSite } from '../../entities/facility/facility-branch-site.entity';
import { FacilityAgreement } from '../../entities/facility/facility-agreement.entity';
import { FacilityDocumentRequired } from '../../entities/facility/facility-document-required.entity';
import { FacilityRule } from '../../entities/facility/facility-rule.entity';
import { User } from '../../entities/user/user.entity';
import { File, EntityType, DocumentType } from '../../entities/file/file.entity';
import FacilityRepository, { IFacilityQueryParams } from '../../repositories/facility.repository';
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import { StringError } from '../../errors/string.error';
import ExcelUtility from '../../utilities/excel.utility';

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
 * Agreement files interface
 */
interface IAgreementFiles {
  mou_document?: Express.Multer.File;
  insurance_doc?: Express.Multer.File;
}

const create = async (params: ICreateFacility, agreementFiles?: Map<number, IAgreementFiles>) => {
  if (!params.organization_name) {
    throw new Error('organization_name is required');
  }

  // Support both formats: direct email/password OR login object
  let email = params.email;
  let password = params.password;
  
  if (params.login) {
    email = params.login.email;
    password = params.login.password;
  }

  // Validate email and password if provided
  if (email && !password) {
    throw new Error('password is required when email is provided');
  }
  if (password && !email) {
    throw new Error('email is required when password is provided');
  }

  // Use transaction to ensure all-or-nothing behavior
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  // Establish connection
  await queryRunner.connect();

  // Start transaction
  await queryRunner.startTransaction();

  try {
    // Create main facility
    const facility = new Facility();
    facility.organization_name = params.organization_name;
    facility.registered_business_name = params.registered_business_name;
    facility.website_url = params.website_url;
    facility.abn_registration_number = params.abn_registration_number;
    facility.source_of_data = params.source_of_data;
    
    // Store states and categories as JSON arrays
    facility.states_covered = params.states_covered || [];
    facility.categories = params.categories || [];

    // Handle location with ST_MakePoint if latitude and longitude provided
    let savedFacility;
    if (params.latitude !== undefined && params.longitude !== undefined) {
      // Save facility first without location
      const tempFacility = await queryRunner.manager.save(facility);
      const facilityId = tempFacility.facility_id;

      // Update with POINT for location (MySQL format: POINT(longitude, latitude))
      await queryRunner.manager.query(
        `UPDATE facility SET location = POINT(?, ?) WHERE facility_id = ?`,
        [params.longitude, params.latitude, facilityId]
      );

      // Fetch the updated facility
      savedFacility = await queryRunner.manager.findOne(Facility, { where: { facility_id: facilityId } });
    } else {
      // Save facility with default location POINT(0, 0)
      const tempFacility = await queryRunner.manager.save(facility);
      const facilityId = tempFacility.facility_id;

      // Set default location
      await queryRunner.manager.query(
        `UPDATE facility SET location = POINT(0, 0) WHERE facility_id = ?`,
        [facilityId]
      );

      savedFacility = await queryRunner.manager.findOne(Facility, { where: { facility_id: facilityId } });
    }

    const facilityId = savedFacility.facility_id;

    // Create user account if email and password provided
    if (email && password) {
      // Check if email already exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { loginID: email }
      });

      if (existingUser) {
        throw new Error(`Email '${email}' already exists`);
      }

      // Get Facility role ID by mapping role name
      const facilityRoleId = await RoleService.getRoleIdByName('Facility');

      // Create user with email as loginID and link to facility
      const user = new User();
      user.loginID = email;
      user.password = await PasswordUtility.hashPassword(password);
      user.roleID = facilityRoleId;
      user.facilityID = facilityId; // Link user to facility
      user.studentID = null;
      user.status = 'active';

      await queryRunner.manager.save(user);
      console.log(`✅ Created facility user account with facilityID=${facilityId}`);
    }

    // Create attributes
    if (params.attributes && params.attributes.length > 0) {
      const attributes = params.attributes.map(attr => {
        const facilityAttr = new FacilityAttribute();
        facilityAttr.facility_id = facilityId;
        facilityAttr.attribute_type = attr.attribute_type;
        facilityAttr.attribute_value = attr.attribute_value;
        return facilityAttr;
      });
      await queryRunner.manager.save(attributes);
    }

    // Create organization structures
    if (params.organization_structures && params.organization_structures.length > 0) {
      const orgStructures = params.organization_structures.map(org => {
        const orgStruct = new FacilityOrganizationStructure();
        orgStruct.facility_id = facilityId;
        orgStruct.deal_with = org.deal_with;
        orgStruct.head_office_addr = org.head_office_addr;
        orgStruct.contact_name = org.contact_name;
        orgStruct.designation = org.designation;
        orgStruct.phone = org.phone;
        orgStruct.email = org.email;
        orgStruct.alternate_contact = org.alternate_contact;
        orgStruct.notes = org.notes;
        return orgStruct;
      });
      await queryRunner.manager.save(orgStructures);
    }

    // Create branches
    if (params.branches && params.branches.length > 0) {
      const branches = params.branches.map(branch => {
        const branchSite = new FacilityBranchSite();
        branchSite.facility_id = facilityId;
        branchSite.site_code = branch.site_code;
        branchSite.full_address = branch.full_address;
        branchSite.suburb = branch.suburb;
        branchSite.city = branch.city;
        branchSite.state = branch.state;
        branchSite.postcode = branch.postcode;
        branchSite.site_type = branch.site_type;
        branchSite.palliative_care = branch.palliative_care || false;
        branchSite.dementia_care = branch.dementia_care || false;
        branchSite.num_beds = branch.num_beds;
        branchSite.gender_rules = branch.gender_rules;
        branchSite.contact_name = branch.contact_name;
        branchSite.contact_role = branch.contact_role;
        branchSite.contact_phone = branch.contact_phone;
        branchSite.contact_email = branch.contact_email;
        branchSite.contact_comments = branch.contact_comments;
        return branchSite;
      });
      await queryRunner.manager.save(branches);
    }

    // Create agreements
    if (params.agreements && params.agreements.length > 0) {
      console.log(`📋 Creating ${params.agreements.length} agreements`);
      console.log(`📁 Agreement files map size: ${agreementFiles?.size || 0}`);
      
      for (let i = 0; i < params.agreements.length; i++) {
        const agr = params.agreements[i];
        const agreement = new FacilityAgreement();
        agreement.facility_id = facilityId;
        agreement.sent_students = agr.sent_students;
        agreement.with_mou = agr.with_mou;
        agreement.no_mou_but_taken = agr.no_mou_but_taken;
        agreement.mou_exists_no_spot = agr.mou_exists_no_spot;
        agreement.total_students = agr.total_students;
        agreement.last_placement = agr.last_placement;
        agreement.has_mou = agr.has_mou;
        agreement.signed_on = agr.signed_on;
        agreement.expiry_date = agr.expiry_date;
        agreement.company_name = agr.company_name
          ? (Array.isArray(agr.company_name) ? agr.company_name : [agr.company_name])
          : agr.company_name;
        agreement.payment_required = agr.payment_required;
        agreement.amount_per_spot = agr.amount_per_spot;
        agreement.payment_notes = agr.payment_notes;
        agreement.mou_document = agr.mou_document;
        agreement.insurance_doc = agr.insurance_doc;
        
        const savedAgreement = await queryRunner.manager.save(agreement);
        console.log(`✅ Agreement ${i} saved with ID: ${savedAgreement.agreement_id}`);
        
        // Upload files if provided for this agreement index
        if (agreementFiles && agreementFiles.has(i)) {
          const files = agreementFiles.get(i)!;
          console.log(`📁 Processing files for agreement ${i}:`, { 
            hasMou: !!files.mou_document, 
            hasInsurance: !!files.insurance_doc 
          });
          
          if (files.mou_document) {
            console.log(`📁 Uploading MOU document for agreement ${i}:`, files.mou_document.originalname);
            const mouPath = await uploadDocument(
              files.mou_document,
              savedAgreement.agreement_id,
              DocumentType.MOU_DOCUMENT,
              queryRunner.manager
            );
            await queryRunner.manager.update(FacilityAgreement, { agreement_id: savedAgreement.agreement_id }, {
              mou_document: mouPath
            });
            console.log(`✅ MOU document path saved: ${mouPath}`);
          }
          
          if (files.insurance_doc) {
            console.log(`📁 Uploading insurance document for agreement ${i}:`, files.insurance_doc.originalname);
            const insurancePath = await uploadDocument(
              files.insurance_doc,
              savedAgreement.agreement_id,
              DocumentType.INSURANCE_DOCUMENT,
              queryRunner.manager
            );
            await queryRunner.manager.update(FacilityAgreement, { agreement_id: savedAgreement.agreement_id }, {
              insurance_doc: insurancePath
            });
            console.log(`✅ Insurance document path saved: ${insurancePath}`);
          }
        } else {
          console.log(`📁 No files for agreement index ${i}`);
        }
      }
    }

    // Create documents required
    if (params.documents_required && params.documents_required.length > 0) {
      const documents = params.documents_required.map(doc => {
        const document = new FacilityDocumentRequired();
        document.facility_id = facilityId;
        document.document_name = doc.document_name;
        document.notice_period_days = doc.notice_period_days;
        document.orientation_req = doc.orientation_req;
        document.facilitator_req = doc.facilitator_req;
        return document;
      });
      await queryRunner.manager.save(documents);
    }

    // Create rules
    if (params.rules && params.rules.length > 0) {
      const rules = params.rules.map(r => {
        const rule = new FacilityRule();
        rule.facility_id = facilityId;
        rule.obligations = r.obligations;
        rule.obligations_univ = r.obligations_univ;
        rule.obligations_student = r.obligations_student;
        rule.process_notes = r.process_notes;
        rule.shift_rules = r.shift_rules;
        rule.attendance_policy = r.attendance_policy;
        rule.dress_code = r.dress_code;
        rule.behaviour_rules = r.behaviour_rules;
        rule.special_instr = r.special_instr;
        return rule;
      });
      await queryRunner.manager.save(rules);
    }

    // Commit transaction - all inserts successful
    await queryRunner.commitTransaction();

    // Return the complete facility with all relations
    return await FacilityRepository.findByIdWithRelations(facilityId);

  } catch (error) {
    // Rollback transaction on any error
    try {
      await queryRunner.rollbackTransaction();
    } catch (rollbackError) {
      console.error('⚠️ Rollback error (transaction may not have started):', rollbackError);
    }
    console.error('❌ Transaction failed, rolling back all changes:', error);
    throw error;
  } finally {
    // Release query runner
    try {
      await queryRunner.release();
    } catch (releaseError) {
      console.error('⚠️ Release error:', releaseError);
    }
  }
};

const getById = async (id: number) => {
  return await FacilityRepository.findById(id);
};

const detail = async (id: number) => {
  const facility = await FacilityRepository.findByIdWithRelations(id);
  if (!facility) {
    throw new StringError('Facility does not exist');
  }
  return facility;
};

const update = async (params: IUpdateFacility, agreementFiles?: Map<number, IAgreementFiles>) => {
  const facility = await FacilityRepository.findById(params.id);
  if (!facility) {
    throw new StringError('Facility does not exist');
  }

  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const facilityId = params.id;

    // Update main facility fields
    if (params.organization_name || params.registered_business_name || params.website_url || 
        params.abn_registration_number || params.source_of_data || params.states_covered || params.categories) {
      const updateData: Partial<Facility> = {
        updatedAt: new Date()
      };
      
      if (params.organization_name !== undefined) updateData.organization_name = params.organization_name;
      if (params.registered_business_name !== undefined) updateData.registered_business_name = params.registered_business_name;
      if (params.website_url !== undefined) updateData.website_url = params.website_url;
      if (params.abn_registration_number !== undefined) updateData.abn_registration_number = params.abn_registration_number;
      if (params.source_of_data !== undefined) updateData.source_of_data = params.source_of_data;
      if (params.states_covered !== undefined) updateData.states_covered = params.states_covered;
      if (params.categories !== undefined) updateData.categories = params.categories;

      await queryRunner.manager.update(Facility, { facility_id: facilityId }, updateData);
    }

    // Update attributes if provided
    if (params.attributes !== undefined) {
      // Delete existing attributes
      await queryRunner.manager.delete(FacilityAttribute, { facility_id: facilityId });
      
      // Insert new attributes
      if (params.attributes.length > 0) {
        const attributes = params.attributes.map(attr => {
          const facilityAttr = new FacilityAttribute();
          facilityAttr.facility_id = facilityId;
          facilityAttr.attribute_type = attr.attribute_type;
          facilityAttr.attribute_value = attr.attribute_value;
          return facilityAttr;
        });
        await queryRunner.manager.save(attributes);
      }
    }

    // Update organization structures if provided
    if (params.organization_structures !== undefined) {
      await queryRunner.manager.delete(FacilityOrganizationStructure, { facility_id: facilityId });
      
      if (params.organization_structures.length > 0) {
        const orgStructures = params.organization_structures.map(org => {
          const orgStruct = new FacilityOrganizationStructure();
          orgStruct.facility_id = facilityId;
          orgStruct.deal_with = org.deal_with;
          orgStruct.head_office_addr = org.head_office_addr;
          orgStruct.contact_name = org.contact_name;
          orgStruct.designation = org.designation;
          orgStruct.phone = org.phone;
          orgStruct.email = org.email;
          orgStruct.alternate_contact = org.alternate_contact;
          orgStruct.notes = org.notes;
          return orgStruct;
        });
        await queryRunner.manager.save(orgStructures);
      }
    }

    // Update branches if provided
    if (params.branches !== undefined) {
      await queryRunner.manager.delete(FacilityBranchSite, { facility_id: facilityId });
      
      if (params.branches.length > 0) {
        const branches = params.branches.map(branch => {
          const branchSite = new FacilityBranchSite();
          branchSite.facility_id = facilityId;
          branchSite.site_code = branch.site_code;
          branchSite.full_address = branch.full_address;
          branchSite.suburb = branch.suburb;
          branchSite.city = branch.city;
          branchSite.state = branch.state;
          branchSite.postcode = branch.postcode;
          branchSite.site_type = branch.site_type;
          branchSite.palliative_care = branch.palliative_care || false;
          branchSite.dementia_care = branch.dementia_care || false;
          branchSite.num_beds = branch.num_beds;
          branchSite.gender_rules = branch.gender_rules;
          branchSite.contact_name = branch.contact_name;
          branchSite.contact_role = branch.contact_role;
          branchSite.contact_phone = branch.contact_phone;
          branchSite.contact_email = branch.contact_email;
          branchSite.contact_comments = branch.contact_comments;
          return branchSite;
        });
        await queryRunner.manager.save(branches);
      }
    }

    // Update agreements if provided
    if (params.agreements !== undefined) {
      // Get existing agreements
      const existingAgreements = await queryRunner.manager.find(FacilityAgreement, {
        where: { facility_id: facilityId },
        order: { agreement_id: 'ASC' }
      });
      
      console.log(`📋 Updating agreements - Existing: ${existingAgreements.length}, New: ${params.agreements.length}`);
      console.log(`📁 Agreement files map size: ${agreementFiles?.size || 0}`);
      
      // Update or create agreements
      for (let i = 0; i < params.agreements.length; i++) {
        const agr = params.agreements[i];
        const existingAgreement = existingAgreements[i];
        
        if (existingAgreement) {
          // UPDATE existing agreement
          console.log(`✏️ Updating existing agreement ID: ${existingAgreement.agreement_id}`);
          
          const updateData: Partial<FacilityAgreement> = {
            sent_students: agr.sent_students,
            with_mou: agr.with_mou,
            no_mou_but_taken: agr.no_mou_but_taken,
            mou_exists_no_spot: agr.mou_exists_no_spot,
            total_students: agr.total_students,
            last_placement: agr.last_placement,
            has_mou: agr.has_mou,
            signed_on: agr.signed_on,
            expiry_date: agr.expiry_date,
            company_name: agr.company_name
              ? (Array.isArray(agr.company_name) ? agr.company_name : [agr.company_name])
              : agr.company_name,
            payment_required: agr.payment_required,
            amount_per_spot: agr.amount_per_spot,
            payment_notes: agr.payment_notes,
            updatedAt: new Date()
          };
          
          // Only update document paths if explicitly provided in request
          if (agr.mou_document !== undefined) {
            updateData.mou_document = agr.mou_document;
          }
          if (agr.insurance_doc !== undefined) {
            updateData.insurance_doc = agr.insurance_doc;
          }
          
          await queryRunner.manager.update(FacilityAgreement, 
            { agreement_id: existingAgreement.agreement_id }, 
            updateData
          );
          
          // Upload new files if provided
          if (agreementFiles && agreementFiles.has(i)) {
            const files = agreementFiles.get(i)!;
            console.log(`📁 Processing files for agreement ${i}:`, { 
              hasMou: !!files.mou_document, 
              hasInsurance: !!files.insurance_doc 
            });
            
            if (files.mou_document) {
              console.log(`📁 Uploading MOU document for agreement ${i}:`, files.mou_document.originalname);
              const mouPath = await uploadDocument(
                files.mou_document,
                existingAgreement.agreement_id,
                DocumentType.MOU_DOCUMENT,
                queryRunner.manager
              );
              await queryRunner.manager.update(FacilityAgreement, 
                { agreement_id: existingAgreement.agreement_id }, 
                { mou_document: mouPath }
              );
              console.log(`✅ MOU document path updated: ${mouPath}`);
            }
            
            if (files.insurance_doc) {
              console.log(`📁 Uploading insurance document for agreement ${i}:`, files.insurance_doc.originalname);
              const insurancePath = await uploadDocument(
                files.insurance_doc,
                existingAgreement.agreement_id,
                DocumentType.INSURANCE_DOCUMENT,
                queryRunner.manager
              );
              await queryRunner.manager.update(FacilityAgreement, 
                { agreement_id: existingAgreement.agreement_id }, 
                { insurance_doc: insurancePath }
              );
              console.log(`✅ Insurance document path updated: ${insurancePath}`);
            }
          }
          
        } else {
          // CREATE new agreement
          console.log(`➕ Creating new agreement at index ${i}`);
          
          const agreement = new FacilityAgreement();
          agreement.facility_id = facilityId;
          agreement.sent_students = agr.sent_students;
          agreement.with_mou = agr.with_mou;
          agreement.no_mou_but_taken = agr.no_mou_but_taken;
          agreement.mou_exists_no_spot = agr.mou_exists_no_spot;
          agreement.total_students = agr.total_students;
          agreement.last_placement = agr.last_placement;
          agreement.has_mou = agr.has_mou;
          agreement.signed_on = agr.signed_on;
          agreement.expiry_date = agr.expiry_date;
          agreement.company_name = agr.company_name
            ? (Array.isArray(agr.company_name) ? agr.company_name : [agr.company_name])
            : agr.company_name;
          agreement.payment_required = agr.payment_required;
          agreement.amount_per_spot = agr.amount_per_spot;
          agreement.payment_notes = agr.payment_notes;
          agreement.mou_document = agr.mou_document || null;
          agreement.insurance_doc = agr.insurance_doc || null;
          
          const savedAgreement = await queryRunner.manager.save(agreement);
          console.log(`✅ New agreement created with ID: ${savedAgreement.agreement_id}`);
          
          // Upload files if provided
          if (agreementFiles && agreementFiles.has(i)) {
            const files = agreementFiles.get(i)!;
            
            if (files.mou_document) {
              const mouPath = await uploadDocument(
                files.mou_document,
                savedAgreement.agreement_id,
                DocumentType.MOU_DOCUMENT,
                queryRunner.manager
              );
              await queryRunner.manager.update(FacilityAgreement, 
                { agreement_id: savedAgreement.agreement_id }, 
                { mou_document: mouPath }
              );
              console.log(`✅ MOU document uploaded: ${mouPath}`);
            }
            
            if (files.insurance_doc) {
              const insurancePath = await uploadDocument(
                files.insurance_doc,
                savedAgreement.agreement_id,
                DocumentType.INSURANCE_DOCUMENT,
                queryRunner.manager
              );
              await queryRunner.manager.update(FacilityAgreement, 
                { agreement_id: savedAgreement.agreement_id }, 
                { insurance_doc: insurancePath }
              );
              console.log(`✅ Insurance document uploaded: ${insurancePath}`);
            }
          }
        }
      }
      
      // Delete extra agreements if new list is shorter
      if (existingAgreements.length > params.agreements.length) {
        const agreementsToDelete = existingAgreements.slice(params.agreements.length);
        for (const agr of agreementsToDelete) {
          console.log(`🗑️ Deleting extra agreement ID: ${agr.agreement_id}`);
          await queryRunner.manager.delete(FacilityAgreement, { agreement_id: agr.agreement_id });
        }
      }
    }

    // Update documents required if provided
    if (params.documents_required !== undefined) {
      await queryRunner.manager.delete(FacilityDocumentRequired, { facility_id: facilityId });
      
      if (params.documents_required.length > 0) {
        const documents = params.documents_required.map(doc => {
          const document = new FacilityDocumentRequired();
          document.facility_id = facilityId;
          document.document_name = doc.document_name;
          document.notice_period_days = doc.notice_period_days;
          document.orientation_req = doc.orientation_req;
          document.facilitator_req = doc.facilitator_req;
          return document;
        });
        await queryRunner.manager.save(documents);
      }
    }

    // Update rules if provided
    if (params.rules !== undefined) {
      await queryRunner.manager.delete(FacilityRule, { facility_id: facilityId });
      
      if (params.rules.length > 0) {
        const rules = params.rules.map(r => {
          const rule = new FacilityRule();
          rule.facility_id = facilityId;
          rule.obligations = r.obligations;
          rule.obligations_univ = r.obligations_univ;
          rule.obligations_student = r.obligations_student;
          rule.process_notes = r.process_notes;
          rule.shift_rules = r.shift_rules;
          rule.attendance_policy = r.attendance_policy;
          rule.dress_code = r.dress_code;
          rule.behaviour_rules = r.behaviour_rules;
          rule.special_instr = r.special_instr;
          return rule;
        });
        await queryRunner.manager.save(rules);
      }
    }

    await queryRunner.commitTransaction();

    return await detail(facilityId);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Update transaction failed, rolling back all changes:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const updateComplete = async (params: IUpdateCompleteFacility) => {
  const facility = await FacilityRepository.findById(params.id);
  if (!facility) {
    throw new StringError('Facility does not exist');
  }

  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const facilityId = params.id;

    // Update main facility fields
    if (params.organization_name || params.registered_business_name || params.website_url || 
        params.abn_registration_number || params.source_of_data || params.states_covered || params.categories) {
      const updateData: Partial<Facility> = {
        updatedAt: new Date()
      };
      
      if (params.organization_name !== undefined) updateData.organization_name = params.organization_name;
      if (params.registered_business_name !== undefined) updateData.registered_business_name = params.registered_business_name;
      if (params.website_url !== undefined) updateData.website_url = params.website_url;
      if (params.abn_registration_number !== undefined) updateData.abn_registration_number = params.abn_registration_number;
      if (params.source_of_data !== undefined) updateData.source_of_data = params.source_of_data;
      if (params.states_covered !== undefined) updateData.states_covered = params.states_covered;
      if (params.categories !== undefined) updateData.categories = params.categories;

      await queryRunner.manager.update(Facility, { facility_id: facilityId }, updateData);
    }

    // Update location if latitude and longitude provided
    if (params.latitude !== undefined && params.longitude !== undefined) {
      await queryRunner.manager.query(
        `UPDATE facility SET location = POINT(?, ?) WHERE facility_id = ?`,
        [params.longitude, params.latitude, facilityId]
      );
    }

    // Update attributes - replace all
    if (params.attributes !== undefined) {
      // Delete existing attributes
      await queryRunner.manager.delete(FacilityAttribute, { facility_id: facilityId });
      
      // Insert new attributes
      if (params.attributes.length > 0) {
        const attributes = params.attributes.map(attr => {
          const facilityAttr = new FacilityAttribute();
          facilityAttr.facility_id = facilityId;
          facilityAttr.attribute_type = attr.attribute_type;
          facilityAttr.attribute_value = attr.attribute_value;
          return facilityAttr;
        });
        await queryRunner.manager.save(attributes);
      }
    }

    // Update organization structures - replace all
    if (params.organization_structures !== undefined) {
      await queryRunner.manager.delete(FacilityOrganizationStructure, { facility_id: facilityId });
      
      if (params.organization_structures.length > 0) {
        const orgStructures = params.organization_structures.map(org => {
          const orgStruct = new FacilityOrganizationStructure();
          orgStruct.facility_id = facilityId;
          orgStruct.deal_with = org.deal_with;
          orgStruct.head_office_addr = org.head_office_addr;
          orgStruct.contact_name = org.contact_name;
          orgStruct.designation = org.designation;
          orgStruct.phone = org.phone;
          orgStruct.email = org.email;
          orgStruct.alternate_contact = org.alternate_contact;
          orgStruct.notes = org.notes;
          return orgStruct;
        });
        await queryRunner.manager.save(orgStructures);
      }
    }

    // Update branches - replace all
    if (params.branches !== undefined) {
      await queryRunner.manager.delete(FacilityBranchSite, { facility_id: facilityId });
      
      if (params.branches.length > 0) {
        const branches = params.branches.map(branch => {
          const branchSite = new FacilityBranchSite();
          branchSite.facility_id = facilityId;
          branchSite.site_code = branch.site_code;
          branchSite.full_address = branch.full_address;
          branchSite.suburb = branch.suburb;
          branchSite.city = branch.city;
          branchSite.state = branch.state;
          branchSite.postcode = branch.postcode;
          branchSite.site_type = branch.site_type;
          branchSite.palliative_care = branch.palliative_care || false;
          branchSite.dementia_care = branch.dementia_care || false;
          branchSite.num_beds = branch.num_beds;
          branchSite.gender_rules = branch.gender_rules;
          branchSite.contact_name = branch.contact_name;
          branchSite.contact_role = branch.contact_role;
          branchSite.contact_phone = branch.contact_phone;
          branchSite.contact_email = branch.contact_email;
          branchSite.contact_comments = branch.contact_comments;
          return branchSite;
        });
        await queryRunner.manager.save(branches);
      }
    }

    // Update agreements - replace all
    if (params.agreements !== undefined) {
      await queryRunner.manager.delete(FacilityAgreement, { facility_id: facilityId });
      
      if (params.agreements.length > 0) {
        const agreements = params.agreements.map(agr => {
          const agreement = new FacilityAgreement();
          agreement.facility_id = facilityId;
          agreement.sent_students = agr.sent_students;
          agreement.with_mou = agr.with_mou;
          agreement.no_mou_but_taken = agr.no_mou_but_taken;
          agreement.mou_exists_no_spot = agr.mou_exists_no_spot;
          agreement.total_students = agr.total_students;
          agreement.last_placement = agr.last_placement;
          agreement.has_mou = agr.has_mou;
          agreement.signed_on = agr.signed_on;
          agreement.expiry_date = agr.expiry_date;
          agreement.company_name = agr.company_name
            ? (Array.isArray(agr.company_name) ? agr.company_name : [agr.company_name])
            : agr.company_name;
          agreement.payment_required = agr.payment_required;
          agreement.amount_per_spot = agr.amount_per_spot;
          agreement.payment_notes = agr.payment_notes;
          agreement.mou_document = agr.mou_document;
          agreement.insurance_doc = agr.insurance_doc;
          return agreement;
        });
        await queryRunner.manager.save(agreements);
      }
    }

    // Update documents required - replace all
    if (params.documents_required !== undefined) {
      await queryRunner.manager.delete(FacilityDocumentRequired, { facility_id: facilityId });
      
      if (params.documents_required.length > 0) {
        const documents = params.documents_required.map(doc => {
          const document = new FacilityDocumentRequired();
          document.facility_id = facilityId;
          document.document_name = doc.document_name;
          document.notice_period_days = doc.notice_period_days;
          document.orientation_req = doc.orientation_req;
          document.facilitator_req = doc.facilitator_req;
          return document;
        });
        await queryRunner.manager.save(documents);
      }
    }

    // Update rules - replace all
    if (params.rules !== undefined) {
      await queryRunner.manager.delete(FacilityRule, { facility_id: facilityId });
      
      if (params.rules.length > 0) {
        const rules = params.rules.map(r => {
          const rule = new FacilityRule();
          rule.facility_id = facilityId;
          rule.obligations = r.obligations;
          rule.obligations_univ = r.obligations_univ;
          rule.obligations_student = r.obligations_student;
          rule.process_notes = r.process_notes;
          rule.shift_rules = r.shift_rules;
          rule.attendance_policy = r.attendance_policy;
          rule.dress_code = r.dress_code;
          rule.behaviour_rules = r.behaviour_rules;
          rule.special_instr = r.special_instr;
          return rule;
        });
        await queryRunner.manager.save(rules);
      }
    }

    await queryRunner.commitTransaction();

    return await FacilityRepository.findByIdWithRelations(facilityId);

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Update transaction failed, rolling back all changes:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const list = async (params: IFacilityQueryParams) => {
  const { facilities, total } = await FacilityRepository.findWithFilters(params);
  const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

  // Transform to include requested fields
  const formattedFacilities = facilities.map(facility => {
    // Get primary organization structure (first one)
    const primaryOrg = facility.organizationStructures && facility.organizationStructures.length > 0
      ? facility.organizationStructures[0]
      : null;

    // Get primary agreement (first one)
    const primaryAgreement = facility.agreements && facility.agreements.length > 0
      ? facility.agreements[0]
      : null;

    return {
      facility_id: facility.facility_id,
      organization_name: facility.organization_name,
      email: primaryOrg?.email || null,
      phone: primaryOrg?.phone || null,
      website_url: facility.website_url || null,
      mou_start_date: primaryAgreement?.signed_on || null,
      mou_end_date: primaryAgreement?.expiry_date || null,
      created_at: facility.createdAt,
      
      // Additional useful fields
      states_covered: facility.states_covered || [],
      categories: facility.categories || [],
      has_mou: primaryAgreement?.has_mou || false,
      source_of_data: facility.source_of_data || null,
      
      // Location coordinates
      latitude: (facility as any).latitude || null,
      longitude: (facility as any).longitude || null
    };
  });

  return { response: formattedFacilities, pagination: pagRes.pagination };
};

const listSimplified = async (params: IFacilityQueryParams) => {
  const { facilities, total } = await FacilityRepository.findWithFilters(params);
  const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

  // Transform to simplified format
  const simplifiedFacilities = facilities.map(facility => ({
    facility_id: facility.facility_id,
    name: facility.organization_name,
    location: facility.branches && facility.branches.length > 0
      ? `${facility.branches[0].city}, ${facility.branches[0].state}`
      : 'Not specified',
    available_slots: facility.agreements && facility.agreements.length > 0
      ? facility.agreements[0].total_students || 0
      : 0,
    num_branches: facility.branches ? facility.branches.length : 0,
    has_mou: facility.agreements && facility.agreements.length > 0
      ? facility.agreements[0].has_mou || false
      : false,
    latitude: (facility as any).latitude || null,
    longitude: (facility as any).longitude || null
  }));

  return { response: simplifiedFacilities, pagination: pagRes.pagination };
};

const remove = async (id: number) => {
  const facility = await FacilityRepository.findById(id);
  if (!facility) {
    throw new StringError('Facility does not exist');
  }

  await FacilityRepository.softDelete(id);
  return { success: true };
};

const permanentlyDelete = async (id: number) => {
  const facility = await FacilityRepository.findById(id);
  if (!facility) {
    throw new StringError('Facility does not exist');
  }

  await FacilityRepository.permanentlyDelete(id);
  return { success: true };
};

export interface ICreateFacility {
  organization_name: string;
  registered_business_name?: string;
  website_url?: string;
  abn_registration_number?: string;
  source_of_data?: string;
  email?: string;
  password?: string;
  login?: {
    email: string;
    password: string;
  };
  latitude?: number;
  longitude?: number;
  states_covered?: string[];
  categories?: string[];
  attributes?: Array<{
    attribute_type: any;
    attribute_value: string;
  }>;
  organization_structures?: Array<{
    deal_with: any;
    head_office_addr?: string;
    contact_name?: string;
    designation?: string;
    phone?: string;
    email?: string;
    alternate_contact?: string;
    notes?: string;
  }>;
  branches?: Array<{
    site_code?: string;
    full_address?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    site_type?: string;
    palliative_care?: boolean;
    dementia_care?: boolean;
    num_beds?: number;
    gender_rules?: string;
    contact_name?: string;
    contact_role?: string;
    contact_phone?: string;
    contact_email?: string;
    contact_comments?: string;
  }>;
  agreements?: Array<{
    sent_students?: boolean;
    with_mou?: boolean;
    no_mou_but_taken?: boolean;
    mou_exists_no_spot?: boolean;
    total_students?: number;
    last_placement?: any;
    has_mou?: boolean;
    signed_on?: any;
    expiry_date?: any;
    company_name?: string[];
    payment_required?: boolean;
    amount_per_spot?: number;
    payment_notes?: string;
    mou_document?: string;
    insurance_doc?: string;
  }>;
  documents_required?: Array<{
    document_name?: string;
    notice_period_days?: number;
    orientation_req?: boolean;
    facilitator_req?: boolean;
  }>;
  rules?: Array<{
    obligations?: string;
    obligations_univ?: string;
    obligations_student?: string;
    process_notes?: string;
    shift_rules?: string;
    attendance_policy?: string;
    dress_code?: string;
    behaviour_rules?: string;
    special_instr?: string;
  }>;
}

export interface IUpdateFacility {
  id: number;
  organization_name?: string;
  registered_business_name?: string;
  website_url?: string;
  abn_registration_number?: string;
  source_of_data?: string;
  latitude?: number;
  longitude?: number;
  states_covered?: string[];
  categories?: string[];
  attributes?: Array<{
    attribute_type: any;
    attribute_value: string;
  }>;
  organization_structures?: Array<{
    deal_with: any;
    head_office_addr?: string;
    contact_name?: string;
    designation?: string;
    phone?: string;
    email?: string;
    alternate_contact?: string;
    notes?: string;
  }>;
  branches?: Array<{
    site_code?: string;
    full_address?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    site_type?: string;
    palliative_care?: boolean;
    dementia_care?: boolean;
    num_beds?: number;
    gender_rules?: string;
    contact_name?: string;
    contact_role?: string;
    contact_phone?: string;
    contact_email?: string;
    contact_comments?: string;
  }>;
  agreements?: Array<{
    sent_students?: boolean;
    with_mou?: boolean;
    no_mou_but_taken?: boolean;
    mou_exists_no_spot?: boolean;
    total_students?: number;
    last_placement?: any;
    has_mou?: boolean;
    signed_on?: any;
    expiry_date?: any;
    company_name?: string[];
    payment_required?: boolean;
    amount_per_spot?: number;
    payment_notes?: string;
    mou_document?: string;
    insurance_doc?: string;
  }>;
  documents_required?: Array<{
    document_name?: string;
    notice_period_days?: number;
    orientation_req?: boolean;
    facilitator_req?: boolean;
  }>;
  rules?: Array<{
    obligations?: string;
    obligations_univ?: string;
    obligations_student?: string;
    process_notes?: string;
    shift_rules?: string;
    attendance_policy?: string;
    dress_code?: string;
    behaviour_rules?: string;
    special_instr?: string;
  }>;
}

export interface IUpdateCompleteFacility {
  id: number;
  organization_name?: string;
  registered_business_name?: string;
  website_url?: string;
  abn_registration_number?: string;
  source_of_data?: string;
  latitude?: number;
  longitude?: number;
  states_covered?: string[];
  categories?: string[];
  attributes?: Array<{
    attribute_type: any;
    attribute_value: string;
  }>;
  organization_structures?: Array<{
    deal_with: any;
    head_office_addr?: string;
    contact_name?: string;
    designation?: string;
    phone?: string;
    email?: string;
    alternate_contact?: string;
    notes?: string;
  }>;
  branches?: Array<{
    site_code?: string;
    full_address?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    site_type?: string;
    palliative_care?: boolean;
    dementia_care?: boolean;
    num_beds?: number;
    gender_rules?: string;
    contact_name?: string;
    contact_role?: string;
    contact_phone?: string;
    contact_email?: string;
    contact_comments?: string;
  }>;
  agreements?: Array<{
    sent_students?: boolean;
    with_mou?: boolean;
    no_mou_but_taken?: boolean;
    mou_exists_no_spot?: boolean;
    total_students?: number;
    last_placement?: any;
    has_mou?: boolean;
    signed_on?: any;
    expiry_date?: any;
    company_name?: string[];
    payment_required?: boolean;
    amount_per_spot?: number;
    payment_notes?: string;
    mou_document?: string;
    insurance_doc?: string;
  }>;
  documents_required?: Array<{
    document_name?: string;
    notice_period_days?: number;
    orientation_req?: boolean;
    facilitator_req?: boolean;
  }>;
  rules?: Array<{
    obligations?: string;
    obligations_univ?: string;
    obligations_student?: string;
    process_notes?: string;
    shift_rules?: string;
    attendance_policy?: string;
    dress_code?: string;
    behaviour_rules?: string;
    special_instr?: string;
  }>;
}

/**
 * Bulk upload facilities from Excel file
 */
interface IBulkFacilityRow {
  organization_name: string;
  registered_business_name?: string;
  website_url?: string;
  abn_registration_number?: string;
  source_of_data?: string;
  email?: string;
  password?: string;
  latitude?: string | number;
  longitude?: string | number;
  states_covered?: string;
  categories?: string;
  attributes?: string;
  organization_structures?: string;
  branches?: string;
  agreements?: string;
  documents_required?: string;
  rules?: string;
}

interface IBulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ row: number; organization_name?: string; errors: string[] }>;
  createdFacilities: Array<{ facility_id: number; organization_name: string }>;
}

const validateFacilityRow = (row: IBulkFacilityRow, rowIndex: number): string[] => {
  const errors: string[] = [];

  if (!row.organization_name || row.organization_name.trim() === '') {
    errors.push('organization_name is required');
  }

  if (row.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) {
      errors.push('Invalid email format');
    }
    if (!row.password || row.password.trim() === '') {
      errors.push('password is required when email is provided');
    }
  }

  if (row.password && !row.email) {
    errors.push('email is required when password is provided');
  }

  if (row.latitude !== undefined && row.latitude !== null && row.latitude !== '') {
    const lat = typeof row.latitude === 'string' ? parseFloat(row.latitude) : row.latitude;
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('latitude must be between -90 and 90');
    }
  }

  if (row.longitude !== undefined && row.longitude !== null && row.longitude !== '') {
    const lng = typeof row.longitude === 'string' ? parseFloat(row.longitude) : row.longitude;
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('longitude must be between -180 and 180');
    }
  }

  // Validate JSON fields
  const jsonFields: Array<keyof IBulkFacilityRow> = ['attributes', 'organization_structures', 'branches', 'agreements', 'documents_required', 'rules'];
  for (const field of jsonFields) {
    const value = row[field];
    if (value && typeof value === 'string' && value.trim() !== '') {
      try {
        JSON.parse(value);
      } catch (e) {
        errors.push(`${field} must be valid JSON format`);
      }
    }
  }

  return errors;
};

const convertRowToFacility = (row: IBulkFacilityRow): ICreateFacility => {
  const facilityData: ICreateFacility = {
    organization_name: row.organization_name.trim(),
    registered_business_name: row.registered_business_name?.trim(),
    website_url: row.website_url?.trim(),
    abn_registration_number: row.abn_registration_number?.trim(),
    source_of_data: row.source_of_data?.trim()
  };

  if (row.email && row.password) {
    facilityData.email = row.email.trim().toLowerCase();
    facilityData.password = row.password.trim();
  }

  if (row.latitude !== undefined && row.latitude !== null && row.latitude !== '') {
    const lat = typeof row.latitude === 'string' ? parseFloat(row.latitude) : row.latitude;
    if (!isNaN(lat)) {
      facilityData.latitude = lat;
    }
  }

  if (row.longitude !== undefined && row.longitude !== null && row.longitude !== '') {
    const lng = typeof row.longitude === 'string' ? parseFloat(row.longitude) : row.longitude;
    if (!isNaN(lng)) {
      facilityData.longitude = lng;
    }
  }

  if (row.states_covered) {
    facilityData.states_covered = row.states_covered
      .split(',')
      .map(s => s.trim())
      .filter(s => s);
  }

  if (row.categories) {
    facilityData.categories = row.categories
      .split(',')
      .map(s => s.trim())
      .filter(s => s);
  }

  // Parse JSON fields
  if (row.attributes && row.attributes.trim() !== '') {
    try {
      facilityData.attributes = JSON.parse(row.attributes);
    } catch (e) {
      // Already validated, should not happen
    }
  }

  if (row.organization_structures && row.organization_structures.trim() !== '') {
    try {
      facilityData.organization_structures = JSON.parse(row.organization_structures);
    } catch (e) {
      // Already validated
    }
  }

  if (row.branches && row.branches.trim() !== '') {
    try {
      facilityData.branches = JSON.parse(row.branches);
    } catch (e) {
      // Already validated
    }
  }

  if (row.agreements && row.agreements.trim() !== '') {
    try {
      facilityData.agreements = JSON.parse(row.agreements);
    } catch (e) {
      // Already validated
    }
  }

  if (row.documents_required && row.documents_required.trim() !== '') {
    try {
      facilityData.documents_required = JSON.parse(row.documents_required);
    } catch (e) {
      // Already validated
    }
  }

  if (row.rules && row.rules.trim() !== '') {
    try {
      facilityData.rules = JSON.parse(row.rules);
    } catch (e) {
      // Already validated
    }
  }

  return facilityData;
};

const bulkUpload = async (filePath: string): Promise<IBulkUploadResult> => {
  const result: IBulkUploadResult = {
    success: false,
    totalRows: 0,
    successCount: 0,
    failureCount: 0,
    errors: [],
    createdFacilities: []
  };

  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();

  try {
    const excelData = ExcelUtility.parseExcelFile<IBulkFacilityRow>(filePath);
    result.totalRows = excelData.length;

    console.log(`📋 Processing ${excelData.length} facility records from Excel file`);

    if (excelData.length === 0) {
      throw new Error('Excel file contains no data rows');
    }

    if (excelData.length > 500) {
      throw new Error(`File contains ${excelData.length} rows. Maximum allowed is 500 records per upload.`);
    }

    const requiredFields = ['organization_name'];
    const structureErrors = ExcelUtility.validateExcelStructure(excelData, requiredFields);
    if (structureErrors.length > 0) {
      result.errors.push({
        row: 0,
        errors: structureErrors.map(err => err.message)
      });
      return result;
    }

    console.log('🔍 Phase 1: Validating all records...');
    
    const validationErrors: Array<{ row: number; organization_name?: string; errors: string[] }> = [];
    const validatedData: Array<{ rowIndex: number; data: ICreateFacility }> = [];

    for (let i = 0; i < excelData.length; i++) {
      const rowIndex = i + 2;
      const row = excelData[i];

      const rowErrors = validateFacilityRow(row, rowIndex);
      if (rowErrors.length > 0) {
        validationErrors.push({
          row: rowIndex,
          organization_name: row.organization_name,
          errors: rowErrors
        });
        continue;
      }

      const facilityData = convertRowToFacility(row);
      validatedData.push({
        rowIndex,
        data: facilityData
      });
    }

    if (validationErrors.length > 0) {
      result.errors = validationErrors;
      result.failureCount = validationErrors.length;
      result.successCount = 0;
      throw new Error(`Validation failed for ${validationErrors.length} records.`);
    }

    console.log('🔍 Phase 2: Checking for duplicate emails...');
    
    const allEmails = validatedData
      .filter(item => item.data.email)
      .map(item => item.data.email!.toLowerCase());

    if (allEmails.length > 0) {
      const emailDuplicates = allEmails.filter((email, index) => allEmails.indexOf(email) !== index);
      if (emailDuplicates.length > 0) {
        throw new Error(`Duplicate emails found: ${[...new Set(emailDuplicates)].join(', ')}`);
      }

      const existingUsers = await getRepository(User).find({ 
        where: { loginID: In(allEmails) } 
      });

      if (existingUsers.length > 0) {
        const existingEmails = existingUsers.map(u => u.loginID).join(', ');
        throw new Error(`Emails already exist: ${existingEmails}`);
      }
    }

    console.log('🔐 Phase 3: Hashing passwords...');
    
    const passwordHashPromises = validatedData
      .filter(item => item.data.password)
      .map(async (item, index) => {
        return {
          index,
          hashedPassword: await PasswordUtility.hashPassword(item.data.password!)
        };
      });

    const hashedPasswords = await Promise.all(passwordHashPromises);
    const passwordMap = new Map(hashedPasswords.map(p => [p.index, p.hashedPassword]));

    const facilityRoleId = await RoleService.getRoleIdByName('Facility');

    console.log('💾 Phase 4: Starting database transaction...');
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const createdFacilities: Array<{ facility_id: number; organization_name: string }> = [];

    try {
      for (let i = 0; i < validatedData.length; i++) {
        const { data: facilityData } = validatedData[i];
        
        console.log(`📝 Creating facility ${i + 1}/${validatedData.length}: ${facilityData.organization_name}`);

        const facility = new Facility();
        facility.organization_name = facilityData.organization_name;
        facility.registered_business_name = facilityData.registered_business_name;
        facility.website_url = facilityData.website_url;
        facility.abn_registration_number = facilityData.abn_registration_number;
        facility.source_of_data = facilityData.source_of_data;
        facility.states_covered = facilityData.states_covered || [];
        facility.categories = facilityData.categories || [];

        let savedFacility;
        if (facilityData.latitude !== undefined && facilityData.longitude !== undefined) {
          const tempFacility = await queryRunner.manager.save(facility);
          const facilityId = tempFacility.facility_id;

          await queryRunner.manager.query(
            `UPDATE facility SET location = POINT(?, ?) WHERE facility_id = ?`,
            [facilityData.longitude, facilityData.latitude, facilityId]
          );

          savedFacility = await queryRunner.manager.findOne(Facility, { where: { facility_id: facilityId } });
        } else {
          const tempFacility = await queryRunner.manager.save(facility);
          const facilityId = tempFacility.facility_id;

          await queryRunner.manager.query(
            `UPDATE facility SET location = POINT(0, 0) WHERE facility_id = ?`,
            [facilityId]
          );

          savedFacility = await queryRunner.manager.findOne(Facility, { where: { facility_id: facilityId } });
        }

        const facilityId = savedFacility.facility_id;

        // Create user account if email and password provided
        if (facilityData.email && facilityData.password) {
          const user = new User();
          user.loginID = facilityData.email;
          user.password = passwordMap.get(i) || await PasswordUtility.hashPassword(facilityData.password);
          user.roleID = facilityRoleId;
          user.facilityID = facilityId;
          user.studentID = null;
          user.status = 'active';

          await queryRunner.manager.save(user);
          console.log(`✅ Created user account for facility: ${facilityData.email}`);
        }

        // Create attributes
        if (facilityData.attributes && facilityData.attributes.length > 0) {
          const attributes = facilityData.attributes.map(attr => {
            const facilityAttr = new FacilityAttribute();
            facilityAttr.facility_id = facilityId;
            facilityAttr.attribute_type = attr.attribute_type;
            facilityAttr.attribute_value = attr.attribute_value;
            return facilityAttr;
          });
          await queryRunner.manager.save(attributes);
        }

        // Create organization structures
        if (facilityData.organization_structures && facilityData.organization_structures.length > 0) {
          const orgStructures = facilityData.organization_structures.map(org => {
            const orgStruct = new FacilityOrganizationStructure();
            orgStruct.facility_id = facilityId;
            orgStruct.deal_with = org.deal_with;
            orgStruct.head_office_addr = org.head_office_addr;
            orgStruct.contact_name = org.contact_name;
            orgStruct.designation = org.designation;
            orgStruct.phone = org.phone;
            orgStruct.email = org.email;
            orgStruct.alternate_contact = org.alternate_contact;
            orgStruct.notes = org.notes;
            return orgStruct;
          });
          await queryRunner.manager.save(orgStructures);
        }

        // Create branches
        if (facilityData.branches && facilityData.branches.length > 0) {
          const branches = facilityData.branches.map(branch => {
            const branchSite = new FacilityBranchSite();
            branchSite.facility_id = facilityId;
            branchSite.site_code = branch.site_code;
            branchSite.full_address = branch.full_address;
            branchSite.suburb = branch.suburb;
            branchSite.city = branch.city;
            branchSite.state = branch.state;
            branchSite.postcode = branch.postcode;
            branchSite.site_type = branch.site_type;
            branchSite.palliative_care = branch.palliative_care || false;
            branchSite.dementia_care = branch.dementia_care || false;
            branchSite.num_beds = branch.num_beds;
            branchSite.gender_rules = branch.gender_rules;
            branchSite.contact_name = branch.contact_name;
            branchSite.contact_role = branch.contact_role;
            branchSite.contact_phone = branch.contact_phone;
            branchSite.contact_email = branch.contact_email;
            branchSite.contact_comments = branch.contact_comments;
            return branchSite;
          });
          await queryRunner.manager.save(branches);
        }

        // Create agreements (without file uploads)
        if (facilityData.agreements && facilityData.agreements.length > 0) {
          const agreements = facilityData.agreements.map(agr => {
            const agreement = new FacilityAgreement();
            agreement.facility_id = facilityId;
            agreement.sent_students = agr.sent_students;
            agreement.with_mou = agr.with_mou;
            agreement.no_mou_but_taken = agr.no_mou_but_taken;
            agreement.mou_exists_no_spot = agr.mou_exists_no_spot;
            agreement.total_students = agr.total_students;
            agreement.last_placement = agr.last_placement;
            agreement.has_mou = agr.has_mou;
            agreement.signed_on = agr.signed_on;
            agreement.expiry_date = agr.expiry_date;
            agreement.company_name = agr.company_name
              ? (Array.isArray(agr.company_name) ? agr.company_name : [agr.company_name])
              : agr.company_name;
            agreement.payment_required = agr.payment_required;
            agreement.amount_per_spot = agr.amount_per_spot;
            agreement.payment_notes = agr.payment_notes;
            return agreement;
          });
          await queryRunner.manager.save(agreements);
        }

        // Create documents required
        if (facilityData.documents_required && facilityData.documents_required.length > 0) {
          const documents = facilityData.documents_required.map(doc => {
            const document = new FacilityDocumentRequired();
            document.facility_id = facilityId;
            document.document_name = doc.document_name;
            document.notice_period_days = doc.notice_period_days;
            document.orientation_req = doc.orientation_req;
            document.facilitator_req = doc.facilitator_req;
            return document;
          });
          await queryRunner.manager.save(documents);
        }

        // Create rules
        if (facilityData.rules && facilityData.rules.length > 0) {
          const rules = facilityData.rules.map(r => {
            const rule = new FacilityRule();
            rule.facility_id = facilityId;
            rule.obligations = r.obligations;
            rule.obligations_univ = r.obligations_univ;
            rule.obligations_student = r.obligations_student;
            rule.process_notes = r.process_notes;
            rule.shift_rules = r.shift_rules;
            rule.attendance_policy = r.attendance_policy;
            rule.dress_code = r.dress_code;
            rule.behaviour_rules = r.behaviour_rules;
            rule.special_instr = r.special_instr;
            return rule;
          });
          await queryRunner.manager.save(rules);
        }

        createdFacilities.push({
          facility_id: facilityId,
          organization_name: savedFacility.organization_name
        });
      }

      await queryRunner.commitTransaction();
      
      result.success = true;
      result.successCount = createdFacilities.length;
      result.createdFacilities = createdFacilities;

      console.log(`✅ Bulk upload completed: ${result.successCount} facilities created`);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Transaction failed, rolling back:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    return result;

  } catch (error) {
    console.error('❌ Bulk upload failed:', error);
    result.success = false;
    
    if (!result.errors.length) {
      result.errors.push({
        row: 0,
        errors: [error.message || 'Unknown error occurred']
      });
    }
    
    return result;
  }
};

export default {
  create,
  getById,
  detail,
  update,
  updateComplete,
  list,
  listSimplified,
  remove,
  permanentlyDelete,
  bulkUpload
};
