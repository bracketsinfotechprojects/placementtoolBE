/**
 * Facility Service Interfaces
 * Centralized type definitions for facility-related operations
 */

export interface ICreateFacility {
  organization_name: string;
  registered_business_name?: string;
  website_url?: string;
  abn_registration_number?: string;
  source_of_data?: string;
  states_covered?: string[];
  categories?: string[];
  latitude?: number;
  longitude?: number;
  email?: string;
  password?: string;
  login?: {
    email: string;
    password: string;
  };
  attributes?: IFacilityAttribute[];
  organization_structures?: IOrganizationStructure[];
  branches?: IBranchSite[];
  agreements?: IAgreement[];
  documents_required?: IDocumentRequired[];
  rules?: IFacilityRule[];
}

export interface IUpdateFacility {
  id: number;
  organization_name?: string;
  registered_business_name?: string;
  website_url?: string;
  abn_registration_number?: string;
  source_of_data?: string;
  states_covered?: string[];
  categories?: string[];
  latitude?: number;
  longitude?: number;
  attributes?: IFacilityAttribute[];
  organization_structures?: IOrganizationStructure[];
  branches?: IBranchSite[];
  agreements?: IAgreement[];
  documents_required?: IDocumentRequired[];
  rules?: IFacilityRule[];
}

export interface IUpdateCompleteFacility extends IUpdateFacility {
  // Complete update includes all fields
}

export interface IFacilityAttribute {
  attribute_type: string;
  attribute_value: string;
}

export interface IOrganizationStructure {
  deal_with?: string;
  head_office_addr?: string;
  contact_name?: string;
  designation?: string;
  phone?: string;
  email?: string;
  alternate_contact?: string;
  notes?: string;
}

export interface IBranchSite {
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
}

export interface IAgreement {
  sent_students?: number;
  with_mou?: number;
  no_mou_but_taken?: number;
  mou_exists_no_spot?: number;
  total_students?: number;
  last_placement?: Date;
  has_mou?: boolean;
  signed_on?: Date;
  expiry_date?: Date;
  company_name?: string | string[];
  payment_required?: boolean;
  amount_per_spot?: number;
  payment_notes?: string;
  mou_document?: string;
  insurance_doc?: string;
}

export interface IDocumentRequired {
  document_name?: string;
  notice_period_days?: number;
  orientation_req?: boolean;
  facilitator_req?: boolean;
}

export interface IFacilityRule {
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

export interface IAgreementFiles {
  mou_document?: Express.Multer.File;
  insurance_doc?: Express.Multer.File;
}

export interface IBulkFacilityRow {
  organization_name: string;
  registered_business_name?: string;
  website_url?: string;
  abn_registration_number?: string;
  source_of_data?: string;
  states_covered?: string;
  categories?: string;
  email?: string;
  password?: string;
  latitude?: string;
  longitude?: string;
}

export interface IBulkUploadResult {
  success: boolean;
  total_rows: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; errors: string[] }>;
  created_facility_ids: number[];
}
