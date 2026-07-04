import { getRepository, getConnection, EntityManager, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';
import { Facility } from '../../entities/facility/facility.entity';
import { FacilityAttribute, AttributeType } from '../../entities/facility/facility-attribute.entity';
import { FacilityOrganizationStructure, DealWithType } from '../../entities/facility/facility-organization-structure.entity';
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

    // Set a valid WKT default so TypeORM generates ST_GeomFromText('POINT(0 0)') in the INSERT
    facility.location = 'POINT(0 0)';

    if (params.latitude !== undefined && params.longitude !== undefined) {
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

    // Update location if latitude and longitude provided
    if (params.latitude !== undefined && params.longitude !== undefined) {
      console.log('📍 Updating facility location:', { latitude: params.latitude, longitude: params.longitude, facilityId });
      await queryRunner.manager.query(
        `UPDATE facility SET location = POINT(?, ?) WHERE facility_id = ?`,
        [params.longitude, params.latitude, facilityId]
      );
      console.log('✅ Facility location updated successfully');
    } else {
      console.log('⚠️ Location not updated - latitude or longitude missing:', { 
        latitude: params.latitude, 
        longitude: params.longitude,
        hasLatitude: params.latitude !== undefined,
        hasLongitude: params.longitude !== undefined
      });
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
      console.log('📍 Updating facility location:', { latitude: params.latitude, longitude: params.longitude, facilityId });
      await queryRunner.manager.query(
        `UPDATE facility SET location = POINT(?, ?) WHERE facility_id = ?`,
        [params.longitude, params.latitude, facilityId]
      );
      console.log('✅ Facility location updated successfully');
    } else {
      console.log('⚠️ Location not updated - latitude or longitude missing:', { 
        latitude: params.latitude, 
        longitude: params.longitude,
        hasLatitude: params.latitude !== undefined,
        hasLongitude: params.longitude !== undefined
      });
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
  // Attributes (up to 3)
  attribute_type_1?: string;
  attribute_value_1?: string;
  attribute_type_2?: string;
  attribute_value_2?: string;
  attribute_type_3?: string;
  attribute_value_3?: string;
  // Organization structure
  deal_with?: string;
  head_office_addr?: string;
  contact_name?: string;
  designation?: string;
  phone?: string;
  alternate_contact?: string;
  notes?: string;
  // Branch / site
  site_code?: string;
  full_address?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  site_type?: string;
  palliative_care?: string;
  dementia_care?: string;
  num_beds?: string | number;
  gender_rules?: string;
  branch_contact_name?: string;
  branch_contact_role?: string;
  branch_contact_phone?: string;
  branch_contact_email?: string;
  branch_contact_comments?: string;
  // Agreement / MOU
  sent_students?: string;
  with_mou?: string;
  no_mou_but_taken?: string;
  mou_exists_no_spot?: string;
  total_students?: string | number;
  last_placement?: string;
  has_mou?: string;
  signed_on?: string;
  expiry_date?: string;
  company_name?: string;
  payment_required?: string;
  amount_per_spot?: string | number;
  payment_notes?: string;
  // Documents required
  document_name?: string;
  notice_period_days?: string | number;
  orientation_req?: string;
  facilitator_req?: string;
  // Rules
  obligations?: string;
  obligations_univ?: string;
  obligations_student?: string;
  process_notes?: string;
  shift_rules?: string;
  attendance_policy?: string;
  dress_code?: string;
  behaviour_rules?: string;
  special_instr?: string;
}

interface IBulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ row: number; organization_name?: string; errors: string[] }>;
  createdFacilities: Array<{ facility_id: number; organization_name: string }>;
}

const parseYesNo = (value?: string): boolean | undefined => {
  if (value === undefined || value === null || value.toString().trim() === '') {
    return undefined;
  }
  return value.toString().trim().toLowerCase() === 'yes';
};

const parseNumericField = (value?: string | number): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? undefined : num;
};

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

  // Validate numeric fields
  const numericFields: Array<keyof IBulkFacilityRow> = ['num_beds', 'total_students', 'amount_per_spot', 'notice_period_days'];
  for (const field of numericFields) {
    const value = row[field];
    if (value !== undefined && value !== null && value !== '' && isNaN(typeof value === 'string' ? parseFloat(value) : value as number)) {
      errors.push(`${field} must be a valid number`);
    }
  }

  // Validate yes/no fields
  const yesNoFields: Array<keyof IBulkFacilityRow> = [
    'palliative_care', 'dementia_care', 'sent_students', 'with_mou', 'no_mou_but_taken',
    'mou_exists_no_spot', 'has_mou', 'payment_required', 'orientation_req', 'facilitator_req'
  ];
  for (const field of yesNoFields) {
    const value = row[field];
    if (value && typeof value === 'string' && value.trim() !== '' && !['yes', 'no'].includes(value.trim().toLowerCase())) {
      errors.push(`${field} must be "yes" or "no"`);
    }
  }

  // Validate attribute_type enum values
  const validAttributeTypes = Object.values(AttributeType);
  for (const n of [1, 2, 3] as const) {
    const type = row[`attribute_type_${n}` as keyof IBulkFacilityRow] as string;
    if (type && type.trim() !== '' && !validAttributeTypes.includes(type.trim() as AttributeType)) {
      errors.push(`attribute_type_${n} must be one of: ${validAttributeTypes.join(', ')}`);
    }
  }

  // Validate deal_with enum value
  const validDealWithTypes = Object.values(DealWithType);
  if (row.deal_with && row.deal_with.trim() !== '' && !validDealWithTypes.includes(row.deal_with.trim() as DealWithType)) {
    errors.push(`deal_with must be one of: ${validDealWithTypes.join(', ')}`);
  }

  const hasOrgStructureData = row.head_office_addr || row.contact_name || row.designation || row.phone || row.alternate_contact || row.notes;
  if (hasOrgStructureData && (!row.deal_with || row.deal_with.trim() === '')) {
    errors.push('deal_with is required when organization structure details are provided');
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

  // Attributes (up to 3 flat attribute_type_N / attribute_value_N column pairs)
  const attributes: Array<{ attribute_type: any; attribute_value: string }> = [];
  for (const n of [1, 2, 3] as const) {
    const type = (row[`attribute_type_${n}` as keyof IBulkFacilityRow] as string)?.trim();
    const value = (row[`attribute_value_${n}` as keyof IBulkFacilityRow] as string)?.trim();
    if (type && value) {
      attributes.push({ attribute_type: type, attribute_value: value });
    }
  }
  if (attributes.length > 0) {
    facilityData.attributes = attributes;
  }

  // Organization structure (one per row)
  if (row.deal_with || row.head_office_addr || row.contact_name || row.designation || row.phone || row.alternate_contact || row.notes) {
    facilityData.organization_structures = [{
      deal_with: row.deal_with?.trim(),
      head_office_addr: row.head_office_addr?.trim(),
      contact_name: row.contact_name?.trim(),
      designation: row.designation?.trim(),
      phone: row.phone?.trim(),
      alternate_contact: row.alternate_contact?.trim(),
      notes: row.notes?.trim()
    }];
  }

  // Branch / site (one per row)
  if (row.site_code || row.full_address || row.suburb || row.city || row.state || row.postcode || row.site_type) {
    facilityData.branches = [{
      site_code: row.site_code?.trim(),
      full_address: row.full_address?.trim(),
      suburb: row.suburb?.trim(),
      city: row.city?.trim(),
      state: row.state?.trim(),
      postcode: row.postcode?.trim(),
      site_type: row.site_type?.trim(),
      palliative_care: parseYesNo(row.palliative_care),
      dementia_care: parseYesNo(row.dementia_care),
      num_beds: parseNumericField(row.num_beds),
      gender_rules: row.gender_rules?.trim(),
      contact_name: row.branch_contact_name?.trim(),
      contact_role: row.branch_contact_role?.trim(),
      contact_phone: row.branch_contact_phone?.trim(),
      contact_email: row.branch_contact_email?.trim(),
      contact_comments: row.branch_contact_comments?.trim()
    }];
  }

  // Agreement / MOU (one per row)
  if (row.sent_students || row.with_mou || row.no_mou_but_taken || row.mou_exists_no_spot || row.total_students ||
    row.last_placement || row.has_mou || row.signed_on || row.expiry_date || row.company_name || row.payment_required ||
    row.amount_per_spot || row.payment_notes) {
    facilityData.agreements = [{
      sent_students: parseYesNo(row.sent_students),
      with_mou: parseYesNo(row.with_mou),
      no_mou_but_taken: parseYesNo(row.no_mou_but_taken),
      mou_exists_no_spot: parseYesNo(row.mou_exists_no_spot),
      total_students: parseNumericField(row.total_students),
      last_placement: row.last_placement?.trim(),
      has_mou: parseYesNo(row.has_mou),
      signed_on: row.signed_on?.trim(),
      expiry_date: row.expiry_date?.trim(),
      company_name: row.company_name?.trim() ? [row.company_name.trim()] : undefined,
      payment_required: parseYesNo(row.payment_required),
      amount_per_spot: parseNumericField(row.amount_per_spot),
      payment_notes: row.payment_notes?.trim()
    }];
  }

  // Documents required (one per row)
  if (row.document_name || row.notice_period_days || row.orientation_req || row.facilitator_req) {
    facilityData.documents_required = [{
      document_name: row.document_name?.trim(),
      notice_period_days: parseNumericField(row.notice_period_days),
      orientation_req: parseYesNo(row.orientation_req),
      facilitator_req: parseYesNo(row.facilitator_req)
    }];
  }

  // Rules (one per row)
  if (row.obligations || row.obligations_univ || row.obligations_student || row.process_notes ||
    row.shift_rules || row.attendance_policy || row.dress_code || row.behaviour_rules || row.special_instr) {
    facilityData.rules = [{
      obligations: row.obligations?.trim(),
      obligations_univ: row.obligations_univ?.trim(),
      obligations_student: row.obligations_student?.trim(),
      process_notes: row.process_notes?.trim(),
      shift_rules: row.shift_rules?.trim(),
      attendance_policy: row.attendance_policy?.trim(),
      dress_code: row.dress_code?.trim(),
      behaviour_rules: row.behaviour_rules?.trim(),
      special_instr: row.special_instr?.trim()
    }];
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
        facility.location = 'POINT(0 0)';

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

const getSlots = async (params: any) => {
  const {
    facility_id,
    status = 'active',
    placementslot_type,
    course_applicable,
    shift_type,
    working_days,
    gender_preference,
    urgent_requirement,
    placement_start_date_from,
    placement_start_date_to,
    placement_end_date_from,
    placement_end_date_to,
    has_available_seats,
    sort_by = 'placement_start_date',
    sort_order = 'ASC',
    limit = 20,
    page = 1
  } = params;

  // Verify facility exists
  const facility = await FacilityRepository.findById(facility_id);
  if (!facility) {
    throw new StringError('Facility does not exist');
  }

  // Import PlacementSlotRepository dynamically to avoid circular dependencies
  const PlacementSlotRepository = require('../../repositories/placement-slot.repository').default;

  // Build query with filters
  const filterParams = {
    facility_id,
    status,
    placementslot_type,
    course_applicable,
    shift_type,
    working_days,
    gender_preference,
    urgent_requirement,
    placement_start_date_from,
    placement_start_date_to,
    placement_end_date_from,
    placement_end_date_to,
    sort_by,
    sort_order,
    limit,
    page
  };

  // Get slots using the repository
  const result = await PlacementSlotRepository.findWithFilters(filterParams);

  // Filter by available seats if requested
  let slots = result.slots;
  if (has_available_seats) {
    slots = slots.filter((slot: any) => slot.remaining_seats > 0);
  }

  return {
    slots,
    total: result.total
  };
};

const generateFacilityTemplate = (): Buffer => {
  const headers = [
    // Core facility fields
    'organization_name', 'registered_business_name', 'website_url', 'abn_registration_number', 'source_of_data',
    'latitude', 'longitude', 'states_covered', 'categories',
    // Login credentials
    'email', 'password',
    // Attribute columns (up to 3)
    'attribute_type_1', 'attribute_value_1',
    'attribute_type_2', 'attribute_value_2',
    'attribute_type_3', 'attribute_value_3',
    // Organization structure
    'deal_with', 'head_office_addr', 'contact_name', 'designation', 'phone', 'alternate_contact', 'notes',
    // Branch / site
    'site_code', 'full_address', 'suburb', 'city', 'state', 'postcode', 'site_type',
    'palliative_care', 'dementia_care', 'num_beds', 'gender_rules',
    'branch_contact_name', 'branch_contact_role', 'branch_contact_phone', 'branch_contact_email', 'branch_contact_comments',
    // Agreement / MOU
    'sent_students', 'with_mou', 'no_mou_but_taken', 'mou_exists_no_spot',
    'total_students', 'last_placement', 'has_mou', 'signed_on', 'expiry_date',
    'company_name', 'payment_required', 'amount_per_spot', 'payment_notes',
    // Documents required
    'document_name', 'notice_period_days', 'orientation_req', 'facilitator_req',
    // Rules
    'obligations', 'obligations_univ', 'obligations_student', 'process_notes',
    'shift_rules', 'attendance_policy', 'dress_code', 'behaviour_rules', 'special_instr',
  ];

  const sampleRow = [
    // Core
    'Sunshine Aged Care', 'Sunshine Care Pty Ltd', 'https://sunshinecare.com.au', '12 345 678 901', 'agedcareguide',
    '-33.8688', '151.2093', 'NSW,VIC', 'agedDisability',
    // Login
    'facility@sunshinecare.com.au', 'Password123!',
    // Attributes
    'specialty', 'Dementia Care',
    'accreditation', 'ISO 9001',
    '', '',
    // Org structure
    'Head Office', '123 Main St Sydney NSW 2000', 'Jane Smith', 'Placement Coordinator', '0298765432', '0412345678', 'Preferred contact via email',
    // Branch
    'SYD-01', '45 Care Lane', 'Parramatta', 'Sydney', 'NSW', '2150', 'Residential',
    'yes', 'yes', '120', 'Mixed',
    'Bob Jones', 'Site Manager', '0298765433', 'bob@sunshinecare.com.au', 'Call before visiting',
    // Agreement
    'yes', 'yes', 'no', 'no',
    '25', '2025-03-15', 'yes', '2024-01-01', '2026-12-31',
    'Sunshine Care Pty Ltd', 'yes', '500', 'Invoice 30 days end of month',
    // Documents
    'Student Insurance Certificate', '14', 'yes', 'no',
    // Rules
    'Students must comply with facility policies', 'University to provide induction materials', 'Students must wear uniform',
    'Contact placement coordinator on day 1', 'Morning: 07:00-15:00, Afternoon: 15:00-23:00',
    'Must attend all rostered shifts', 'Full uniform including closed-toe shoes', 'Professional behaviour at all times',
    'No mobile phones in resident areas',
  ];

  const instructionsData: any[][] = [
    ['FACILITY BULK UPLOAD — COLUMN GUIDE'],
    [''],
    ['REQUIRED'],
    ['organization_name', 'Full legal name of the facility (required)'],
    [''],
    ['CORE FACILITY FIELDS'],
    ['registered_business_name', 'Trading / registered business name'],
    ['website_url', 'Full URL including https://'],
    ['abn_registration_number', 'Australian Business Number'],
    ['source_of_data', 'Where the facility data came from (e.g. agedcareguide)'],
    ['latitude', 'Decimal degrees, e.g. -33.8688'],
    ['longitude', 'Decimal degrees, e.g. 151.2093'],
    ['states_covered', 'Comma-separated state codes, e.g. NSW,VIC,QLD'],
    ['categories', 'Comma-separated categories, e.g. agedDisability,disability'],
    [''],
    ['LOGIN CREDENTIALS (both required together if provided)'],
    ['email', 'Login email address — must be unique'],
    ['password', 'Login password (min 8 chars)'],
    [''],
    ['ATTRIBUTES (up to 3 per facility)'],
    ['attribute_type_1 / attribute_value_1', 'Type must be one of: Category, State, care_type, capacity, facility_type, accreditation, specialty — e.g. specialty / Dementia Care'],
    ['attribute_type_2 / attribute_value_2', 'e.g. accreditation / ISO 9001'],
    ['attribute_type_3 / attribute_value_3', 'Additional attribute (optional)'],
    [''],
    ['ORGANISATION STRUCTURE'],
    ['deal_with', 'Must be one of: Head Office, Branch, Both'],
    ['head_office_addr', 'Head office address'],
    ['contact_name', 'Primary contact person name'],
    ['designation', 'Contact person job title'],
    ['phone', 'Primary phone number'],
    ['alternate_contact', 'Alternate phone number'],
    ['notes', 'Any additional notes about the organisation'],
    [''],
    ['BRANCH / SITE (one branch per row)'],
    ['site_code', 'Unique site/branch code (e.g. SYD-01)'],
    ['full_address', 'Street address of the branch'],
    ['suburb', 'Suburb'],
    ['city', 'City'],
    ['state', 'State abbreviation (e.g. NSW)'],
    ['postcode', 'Postcode'],
    ['site_type', 'Type of site (e.g. Residential, Community)'],
    ['palliative_care', 'yes / no'],
    ['dementia_care', 'yes / no'],
    ['num_beds', 'Number of beds (number)'],
    ['gender_rules', 'Gender preference (e.g. Mixed, Female Only)'],
    ['branch_contact_name', 'Branch contact person name'],
    ['branch_contact_role', 'Branch contact role/title'],
    ['branch_contact_phone', 'Branch contact phone'],
    ['branch_contact_email', 'Branch contact email'],
    ['branch_contact_comments', 'Additional comments for branch contact'],
    [''],
    ['MOU / AGREEMENT'],
    ['sent_students', 'Have students been sent? yes / no'],
    ['with_mou', 'Was there an MOU when students were sent? yes / no'],
    ['no_mou_but_taken', 'Students taken without MOU? yes / no'],
    ['mou_exists_no_spot', 'MOU exists but no spot available? yes / no'],
    ['total_students', 'Total number of students placed (number)'],
    ['last_placement', 'Date of last placement (YYYY-MM-DD)'],
    ['has_mou', 'Is there a current MOU? yes / no'],
    ['signed_on', 'MOU signed date (YYYY-MM-DD)'],
    ['expiry_date', 'MOU expiry date (YYYY-MM-DD)'],
    ['company_name', 'Company name on the MOU'],
    ['payment_required', 'Is payment required? yes / no'],
    ['amount_per_spot', 'Payment amount per student spot (number)'],
    ['payment_notes', 'Payment terms or notes'],
    [''],
    ['DOCUMENTS REQUIRED'],
    ['document_name', 'Name of required document (e.g. Student Insurance Certificate)'],
    ['notice_period_days', 'Days notice required before placement (number)'],
    ['orientation_req', 'Orientation required? yes / no'],
    ['facilitator_req', 'Facilitator required? yes / no'],
    [''],
    ['RULES / POLICIES'],
    ['obligations', 'General placement obligations'],
    ['obligations_univ', 'University obligations'],
    ['obligations_student', 'Student obligations'],
    ['process_notes', 'Process / onboarding notes'],
    ['shift_rules', 'Shift schedule rules'],
    ['attendance_policy', 'Attendance expectations'],
    ['dress_code', 'Dress code requirements'],
    ['behaviour_rules', 'Conduct / behaviour rules'],
    ['special_instr', 'Any special instructions'],
    [''],
    ['BOOLEAN VALUES: use "yes" or "no" (or "true"/"false" or "1"/"0")'],
    ['DATES: use YYYY-MM-DD format'],
    ['MULTIPLE VALUES: separate with commas (states_covered, categories)'],
  ];

  const XLSX = require('xlsx');

  const dataWs = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  // Column widths
  dataWs['!cols'] = headers.map(h => {
    if (['organization_name', 'registered_business_name', 'full_address', 'website_url',
      'obligations', 'obligations_univ', 'obligations_student', 'process_notes',
      'shift_rules', 'attendance_policy', 'behaviour_rules', 'special_instr'].includes(h)) {
      return { wch: 35 };
    }
    if (['email', 'head_office_addr', 'contact_name', 'branch_contact_name', 'document_name', 'company_name', 'notes'].includes(h)) {
      return { wch: 28 };
    }
    return { wch: 18 };
  });

  const instrWs = XLSX.utils.aoa_to_sheet(instructionsData);
  instrWs['!cols'] = [{ wch: 35 }, { wch: 55 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, dataWs, 'Facilities');
  XLSX.utils.book_append_sheet(wb, instrWs, 'Instructions');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
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
  bulkUpload,
  generateFacilityTemplate,
  getSlots
};
