/**
 * Facility Supervisor Service Interfaces
 * Centralized type definitions for facility supervisor operations
 */

export interface ICreateFacilitySupervisor {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  facility_id?: number;
  department?: string;
  designation?: string;
  experience_years?: number;
  status?: 'active' | 'inactive' | 'on_leave';
  password?: string;
  login?: {
    email: string;
    password: string;
    status?: 'active' | 'inactive';
  };
}

export interface IUpdateFacilitySupervisor {
  supervisor_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  facility_id?: number;
  department?: string;
  designation?: string;
  experience_years?: number;
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface IFacilitySupervisorQueryParams {
  keyword?: string;
  status?: string;
  facility_id?: number;
  department?: string;
  designation?: string;
  min_experience?: number;
  max_experience?: number;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}

export interface IBulkSupervisorRow {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  facility_id?: string;
  department?: string;
  designation?: string;
  experience_years?: string;
  status?: string;
  password?: string;
  login_status?: string;
}

export interface IBulkUploadResult {
  success: boolean;
  total_rows: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; errors: string[] }>;
  created_supervisor_ids: number[];
}
