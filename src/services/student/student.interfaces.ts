/**
 * Student Service Interfaces
 * Centralized type definitions for student-related operations
 */

export interface ICreateStudent {
  first_name: string;
  last_name: string;
  dob: Date;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status?: 'active' | 'inactive' | 'internship_completed' | 'eligible_for_certification' | 'placement_initiated' | 'self_placement_verification_pending' | 'self_placement_approved' | 'certified' | 'completed' | 'graduated' | 'withdrawn';
  latitude?: number;
  longitude?: number;
  email?: string;
  password?: string;
  login?: {
    email: string;
    password: string;
    status?: 'active' | 'inactive';
  };
  contact_details?: ICreateContactDetails;
  visa_details?: ICreateVisaDetails;
  addresses?: ICreateAddress[];
  eligibility_status?: ICreateEligibilityStatus;
  student_lifestyle?: ICreateStudentLifestyle;
  placement_preferences?: ICreatePlacementPreferences;
}

export interface ICreateExternalStudent {
  first_name: string;
  last_name: string;
  dob: Date;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status?: 'active' | 'inactive' | 'internship_completed' | 'eligible_for_certification' | 'placement_initiated' | 'self_placement_verification_pending' | 'self_placement_approved' | 'certified' | 'completed' | 'graduated' | 'withdrawn';
  latitude?: number;
  longitude?: number;
  contact_details?: ICreateContactDetails;
  visa_details?: ICreateVisaDetails;
  addresses?: ICreateAddress[];
}

export interface IUpdateStudent {
  student_id: number;
  first_name?: string;
  last_name?: string;
  dob?: Date;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status?: 'active' | 'inactive' | 'internship_completed' | 'eligible_for_certification' | 'placement_initiated' | 'self_placement_verification_pending' | 'self_placement_approved' | 'certified' | 'completed' | 'graduated' | 'withdrawn';
  latitude?: number;
  longitude?: number;
  contact_details?: ICreateContactDetails;
  visa_details?: ICreateVisaDetails;
  addresses?: ICreateAddress[];
  eligibility_status?: ICreateEligibilityStatus;
  student_lifestyle?: ICreateStudentLifestyle;
  placement_preferences?: ICreatePlacementPreferences;
}

export interface IStudentQueryParams {
  keyword?: string;
  status?: string | string[];
  student_type?: string | string[];
  nationality?: string;
  min_age?: number;
  max_age?: number;
  created_from?: string;
  created_to?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
  activation_status?: 'active' | 'inactive' | 'all';
  city?: string | string[];
  course_completed?: string | string[];
  checklist_approval?: 'true' | 'false' | 'all';
}

export interface IStudentDetail {
  student_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  dob: Date;
  age: number;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status: string;
  contact_details?: any[];
  visa_details?: any[];
  addresses?: any[];
  eligibility_status?: any[];
  student_lifestyle?: any[];
  placement_preferences?: any[];
  facility_records?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudentListResponse {
  response: IStudentDetail[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface IStudentStatistics {
  total_students: number;
  active_students: number;
  international_students: number;
  graduated_students: number;
  inactive_students: number;
  domestic_students: number;
}

export interface IBulkUpdateStatus {
  student_ids: number[];
  status: string;
}

export interface IAdvancedSearchParams {
  name?: string;
  nationality?: string;
  student_type?: string;
  status?: string;
  activation_status?: 'active' | 'inactive' | 'all';
  min_age?: number;
  max_age?: number;
  has_visa?: boolean;
  limit?: number;
  page?: number;
}

export interface ICreateContactDetails {
  primary_mobile?: string;
  email?: string;
  alternate_contact?: string;
  emergency_contact?: string;
  emergency_contact_name?: string;
  relationship?: string;
  contact_type?: 'mobile' | 'landline' | 'whatsapp';
  is_primary?: boolean;
  verified_at?: Date;
}

export interface ICreateVisaDetails {
  visa_type?: string;
  visa_number?: string;
  start_date?: Date;
  expiry_date?: Date;
  status?: 'active' | 'expired' | 'revoked' | 'pending';
  issuing_country?: string;
  document_path?: string;
  work_limitation?: string;
}

export interface ICreateAddress {
  line1?: string;
  line2?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  address_type?: 'current' | 'permanent' | 'temporary' | 'mailing';
  is_primary?: boolean;
}

export interface ICreateEligibilityStatus {
  classes_completed?: boolean;
  fees_paid?: boolean;
  assignments_submitted?: boolean;
  documents_submitted?: boolean;
  trainer_consent?: boolean;
  override_requested?: boolean;
  manual_override?: boolean;
  manual_handling?: boolean;
  requested_by?: string;
  reason?: string;
  comments?: string;
  overall_status?: 'eligible' | 'not_eligible' | 'pending' | 'override';
}

export interface ICreateStudentLifestyle {
  currently_working?: boolean;
  working_hours?: string;
  has_dependents?: boolean;
  married?: boolean;
  driving_license?: boolean;
  own_vehicle?: boolean;
  public_transport_only?: boolean;
  can_travel_long_distance?: boolean;
  drop_support_available?: boolean;
  fully_flexible?: boolean;
  rush_placement_required?: boolean;
  preferred_days?: string;
  preferred_time_slots?: string;
  additional_notes?: string;
}

export interface ICreatePlacementPreferences {
  preferred_states?: string;
  preferred_cities?: string;
  max_travel_distance_km?: number;
  morning_only?: boolean;
  evening_only?: boolean;
  night_shift?: boolean;
  weekend_only?: boolean;
  part_time?: boolean;
  full_time?: boolean;
  with_friend?: boolean;
  friend_name_or_id?: string;
  with_spouse?: boolean;
  spouse_name_or_id?: string;
  earliest_start_date?: Date;
  latest_start_date?: Date;
  specific_month_preference?: string;
  urgency_level?: 'immediate' | 'within_month' | 'within_quarter' | 'flexible';
  additional_preferences?: string;
}

export interface ICreateFacilityRecords {
  facility_name?: string;
  facility_type?: string;
  branch_site?: string;
  facility_address?: string;
  contact_person_name?: string;
  contact_email?: string;
  contact_phone?: string;
  supervisor_name?: string;
  distance_from_student_km?: number;
  slot_id?: string;
  course_type?: string;
  shift_timing?: string;
  start_date?: Date;
  duration_hours?: number;
  gender_requirement?: string;
  applied_on?: Date;
  student_confirmed?: boolean;
  student_comments?: string;
  document_type?: string;
  file_path?: string;
  application_status?: 'applied' | 'under_review' | 'accepted' | 'rejected' | 'confirmed' | 'completed';
}

export interface ICreateAddressChangeRequest {
  current_address?: string;
  new_address?: string;
  effective_date?: Date;
  change_reason?: string;
  impact_acknowledged?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'implemented';
  reviewed_at?: Date;
  reviewed_by?: string;
  review_comments?: string;
  line1?: string;
  line2?: string;
  suburb?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  address_type?: 'current' | 'permanent' | 'temporary' | 'mailing';
  is_primary?: boolean;
  change_request?: {
    current_address?: string;
    new_address?: string;
    effective_date?: Date;
    change_reason?: string;
    impact_acknowledged?: boolean;
    status?: 'pending' | 'approved' | 'rejected' | 'implemented';
    reviewed_at?: Date;
    reviewed_by?: string;
    review_comments?: string;
  };
}

export interface ICreateJobStatusUpdate {
  status: string;
  last_updated_on?: Date;
  employer_name?: string;
  job_role?: string;
  start_date?: Date;
  employment_type?: string;
  offer_letter_path?: string;
  actively_applying?: boolean;
  expected_timeline?: string;
  searching_comments?: string;
  created_at?: Date;
}

export interface ICreateSelfPlacement {
  facility_name?: string;
  facility_address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  start_date?: Date;
  end_date?: Date;
  hours_per_week?: number;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_phone?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  verified_by?: string;
  verified_at?: Date;
}

export interface IUpdateAddressChangeRequest {
  acr_id: number;
  current_address?: string;
  new_address?: string;
  effective_date?: Date;
  change_reason?: string;
  impact_acknowledged?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'implemented';
  reviewed_at?: Date;
  reviewed_by?: string;
  review_comments?: string;
}

export interface IUpdateJobStatusUpdate {
  jsu_id: number;
  status?: string;
  last_updated_on?: Date;
  employer_name?: string;
  job_role?: string;
  start_date?: Date;
  employment_type?: string;
  offer_letter_path?: string;
  actively_applying?: boolean;
  expected_timeline?: string;
  searching_comments?: string;
}

export interface IUpdateSelfPlacement {
  sp_id: number;
  facility_name?: string;
  facility_address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  start_date?: Date;
  end_date?: Date;
  hours_per_week?: number;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_phone?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  verified_by?: string;
  verified_at?: Date;
}

export interface IBulkUploadResult {
  success: boolean;
  total_rows: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; errors: string[] }>;
  created_student_ids: number[];
}

export interface IBulkStudentRow {
  first_name: string;
  last_name: string;
  dob: string;
  gender?: string;
  nationality?: string;
  student_type?: string;
  status?: string;
  primary_mobile?: string;
  email?: string;
  emergency_contact?: string;
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  visa_type?: string;
  visa_number?: string;
  visa_expiry_date?: string;
  latitude?: number;
  longitude?: number;
}
