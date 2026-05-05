/**
 * Placement Executive Service Interfaces
 * Centralized type definitions for placement executive operations
 */

export interface ICreatePlacementExecutive {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  experience_years?: number;
  status?: 'active' | 'inactive' | 'on_leave';
  photograph_path?: string;
  password?: string;
  login?: {
    email: string;
    password: string;
    status?: 'active' | 'inactive';
  };
}

export interface IUpdatePlacementExecutive {
  placement_executive_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  experience_years?: number;
  status?: 'active' | 'inactive' | 'on_leave';
  photograph_path?: string;
}

export interface IPlacementExecutiveQueryParams {
  keyword?: string;
  status?: string;
  department?: string;
  designation?: string;
  min_experience?: number;
  max_experience?: number;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}

export interface IBulkExecutiveRow {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
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
  created_executive_ids: number[];
}
