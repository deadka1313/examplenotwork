import { IAccountDataResponse, IPermissionGetResponse } from '../models/types';
import { IAccountLoginData, IAccountLoginResponse } from 'modules/core/models/types';

import Api from 'api/Api';

export default class CoreApi {
  static getPermissions(): Promise<IPermissionGetResponse> {
    return Api.get('/api/v1/permissions');
  }

  static login(data: IAccountLoginData): Promise<IAccountLoginResponse> {
    return Api.login(data, '/api/v1/auth/signin');
  }

  static getProfile(profileGuid: string): Promise<IAccountDataResponse> {
    return Api.get(`/api/v1/profiles/${profileGuid}`);
  }
}
