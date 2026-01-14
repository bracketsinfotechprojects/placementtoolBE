import { getRepository, getConnection } from 'typeorm';
import { Facility } from '../../entities/facility/facility.entity';
import { FacilityAttribute } from '../../entities/facility/facility-attribute.entity';
import { FacilityOrganizationStructure } from '../../entities/facility/facility-organization-structure.entity';
import { FacilityBranchSite } from '../../entities/facility/facility-branch-site.entity';
import { FacilityAgreement } from '../../entities/facility/facility-agreement.entity';
import { FacilityDocumentRequired } from '../../entities/facility/facility-document-required.entity';
import { FacilityRule } from '../../entities/facility/facility-rule.entity';
import { User } from '../../entities/user/user.entity';
import FacilityRepository, { IFacilityQueryParams } from '../../repositories/facility.repository';
import ApiUtility from '../../utilities/api.utility';
import PasswordUtility from '../../utilities/password.utility';
import RoleService from '../role/role.service';
import { StringError } from '../../errors/string.error';

const create = async (params: ICreateFacility) => {
  if (!params.organization_name) {
    throw new Error('organization_name is required');
  }

  // Validate email and password if provided
  if (params.email && !params.password) {
    throw new Error('password is required when email is provided');
  }
  if (params.password && !params.email) {
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

    const savedFacility = await queryRunner.manager.save(facility);
    const facilityId = savedFacility.facility_id;

    // Create user account if email and password provided
    if (params.email && params.password) {
      // Check if email already exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { loginID: params.email }
      });

      if (existingUser) {
        throw new Error(`Email '${params.email}' already exists`);
      }

      // Get Facility role ID by mapping role name
      const facilityRoleId = await RoleService.getRoleIdByName('Facility');

      // Create user with email as loginID
      const user = new User();
      user.loginID = params.email;
      user.password = await PasswordUtility.hashPassword(params.password);
      user.roleID = facilityRoleId;
      user.studentID = null;
      user.status = 'active';

      await queryRunner.manager.save(user);
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
        agreement.company_name = agr.company_name;
        agreement.payment_required = agr.payment_required;
        agreement.amount_per_spot = agr.amount_per_spot;
        agreement.payment_notes = agr.payment_notes;
        agreement.mou_document = agr.mou_document;
        agreement.insurance_doc = agr.insurance_doc;
        return agreement;
      });
      await queryRunner.manager.save(agreements);
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
    await queryRunner.rollbackTransaction();
    console.error('❌ Transaction failed, rolling back all changes:', error);
    throw error;
  } finally {
    // Release query runner
    await queryRunner.release();
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

const update = async (params: IUpdateFacility) => {
  const facility = await FacilityRepository.findById(params.id);
  if (!facility) {
    throw new StringError('Facility does not exist');
  }

  const updateData: Partial<Facility> = {
    organization_name: params.organization_name,
    registered_business_name: params.registered_business_name,
    website_url: params.website_url,
    abn_registration_number: params.abn_registration_number,
    source_of_data: params.source_of_data,
    updatedAt: new Date()
  };

  await getRepository(Facility).update({ facility_id: params.id }, updateData);
  return await detail(params.id);
};

const list = async (params: IFacilityQueryParams) => {
  const { facilities, total } = await FacilityRepository.findWithFilters(params);
  const pagRes = ApiUtility.getPagination(total, params.limit, params.page);

  return { response: facilities, pagination: pagRes.pagination };
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
      : false
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
    company_name?: string;
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
}

export default {
  create,
  getById,
  detail,
  update,
  list,
  listSimplified,
  remove,
  permanentlyDelete
};
