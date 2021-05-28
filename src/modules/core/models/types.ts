import {
  IApiResponseErrorMD2,
  IApiResponsePaginationMD2,
  IGenApiResponseMD2,
  IGenResponseAxios,
} from 'api/types';

import { IProfile } from 'modules/user/models/types';

export interface IPermission {
  [permissionId: string]: boolean;
}

type IPermissionGetApiResponse = IGenApiResponseMD2<
  IPermission,
  IApiResponsePaginationMD2,
  IApiResponseErrorMD2
>;

export type IPermissionGetResponse = IGenResponseAxios<IPermissionGetApiResponse>;

export interface IAccountLoginData {
  login: string;
  password: string;
  rememberMe?: boolean;
}

export interface IIdentity {
  guid: string;
  login: string;
  profile_guid: string;
  creator_guid: string;
  created_at: string;
  updated_at: string;
}

export interface IToken {
  token: string;
  refresh: string;
}

export interface IAccountLoginResponseData {
  profile: IProfile;
  tokens: IToken;
}

type IAccountLoginApiResponse = IGenApiResponseMD2<
  IAccountLoginResponseData,
  IApiResponsePaginationMD2,
  IApiResponseErrorMD2
>;

export type IAccountDatarApiResponse = IGenApiResponseMD2<
  IProfile,
  IApiResponsePaginationMD2,
  IApiResponseErrorMD2
>;

export type IAccountLoginResponse = IGenResponseAxios<IAccountLoginApiResponse>;
export type IAccountDataResponse = IGenResponseAxios<IAccountDatarApiResponse>;
