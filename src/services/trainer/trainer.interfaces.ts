/**
 * Trainer Service Interfaces
 * Centralized type definitions for trainer-related operations
 */

export interface ICreateTrainer {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
  experience_years?: number;
  status?: 'active' | 'inactive' | 'on_leave';
  photograph_path?: string;
  wwc_check_number?: string;
  wwc_check_expiry?: Date;
  wwc_check_status?: 'valid' | 'expired' | 'pending' | 'rejected';
  wwc_document_path?: string;
  police_check_date?: Date;
  police_check_status?: 'clear' | 'pending' | 'issues';
  police_check_document_path?: string;
  password?: string;
  login?: {
    email: string;
    password: string;
    status?: 'active' | 'inactive';
  };
}

export interface IUpdateTrainer {
  trainer_id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
  experience_years?: number;
  status?: 'active' | 'inactive' | 'on_leave';
  photograph_path?: string;
  wwc_check_number?: string;
  wwc_check_expiry?: Date;
  wwc_check_status?: 'valid' | 'expired' | 'pending' | 'rejected';
  wwc_document_path?: string;
  police_check_date?: Date;
  police_check_status?: 'clear' | 'pending' | 'issues';
  police_check_document_path?: string;
}

export interface ITrainerQueryParams {
  keyword?: string;
  status?: string;
  specialization?: string;
  min_experience?: number;
  max_experience?: number;
  wwc_status?: string;
  police_check_status?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  page?: number;
}

export interface IBulkTrainerRow {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
  experience_years?: string;
  status?: string;
  wwc_check_number?: string;
  wwc_check_expiry?: string;
  wwc_check_status?: string;
  police_check_date?: string;
  police_check_status?: string;
  password?: string;
  login_status?: string;
}

export interface IBulkUploadResult {
  success: boolean;
  total_rows: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; errors: string[] }>;
  created_trainer_ids: number[];
}
