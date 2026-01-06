// Interfaces
import { IBaseQueryParams } from './common.interface';

export interface ICreateUser {
  loginID: string;
  password: string;
  userRole?: string;
  status?: string;
}

export interface ILoginUser {
  loginID: string;
  password: string;
}

export interface IUpdateUser {
  id: number;
  loginID?: string;
  password?: string;
  userRole?: string;
  status?: string;
}

export interface IUserQueryParams extends IBaseQueryParams {
  keyword?: string;
  status?: string;
  userRole?: string;
}
