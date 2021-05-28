import { action, makeObservable, observable } from 'mobx';
import {
  getProfileGUIDFromToken,
  getTokenLocalStorage,
  removeTokenLocalStorage,
  setRefreshLocalStorage,
  setTokenLocalStorage,
} from 'helpers/token';

import Api from 'api/Api';
import CoreApi from 'modules/core/api/CoreApi';
import { IAccountLoginData } from 'modules/core/models/types';
import { IConfig } from 'helpers/config';
import { IPermission } from 'modules/core/models/types';
import { IProfile } from 'modules/user/models/types';
import { RestException } from 'api/RestException';

export class CoreStore {
  permissions: IPermission = null;
  permissionsIsLoading = true;

  accountData: IProfile = null;
  accountIsLoading = true;

  loginIsLoading = false;

  token: string = null;
  config: IConfig = null;

  isHeaderOpened = false;

  constructor() {
    makeObservable(this, {
      permissions: observable,
      permissionsIsLoading: observable,
      accountData: observable,
      accountIsLoading: observable,
      loginIsLoading: observable,
      token: observable,
      config: observable,
      getProfile: action.bound,
      getPermissions: action.bound,
      login: action.bound,
      logout: action.bound,
      getConfigs: action.bound,
      setToken: action.bound,
      setRefreshToken: action.bound,
      getToken: action.bound,
      isHeaderOpened: observable,
      toggleHeader: action.bound,
    });

    this.getToken();
    this.getConfigs().then(() => {
      if (this.token) {
        this.getProfile(getProfileGUIDFromToken(this.token));
        this.getPermissions();
      }
    });
  }

  async getProfile(profileGuid: string): Promise<IProfile> {
    try {
      this.accountIsLoading = true;
      const { data: res } = await CoreApi.getProfile(profileGuid);
      this.accountIsLoading = false;
      this.accountData = res.data;
      return res.data;
    } catch (e) {
      this.accountIsLoading = false;
      throw new RestException(e);
    }
  }

  async getPermissions(): Promise<IPermission> {
    try {
      this.permissionsIsLoading = true;
      const { data: res } = await CoreApi.getPermissions();
      this.permissions = res.data;
      this.permissionsIsLoading = false;
      return res.data;
    } catch (e) {
      this.permissionsIsLoading = false;
      throw new RestException(e);
    }
  }

  async login(data: IAccountLoginData): Promise<void> {
    try {
      this.loginIsLoading = true;
      const { data: res } = await CoreApi.login(data);
      if (res.data && res.data.tokens) {
        this.setToken(res.data.tokens.token);
        this.setRefreshToken(res.data.tokens.refresh);
        await this.getProfile(getProfileGUIDFromToken(this.token));
        await this.getPermissions();
      }
      this.loginIsLoading = false;
    } catch (e) {
      this.loginIsLoading = false;
      throw new RestException(e);
    }
  }

  logout(): void {
    removeTokenLocalStorage();
    window.location.href = '/login';
  }

  async getConfigs(): Promise<void> {
    try {
      this.config = await fetch('/api-config.json').then((res: Response) => res.json());
      Api.host = this.config.hostMD2;
      Api.serviceUrl = this.config.route.serviceUrl;
    } catch (e) {
      throw new RestException(e);
    }
  }

  setToken(token): void {
    setTokenLocalStorage(token);
    this.token = token;
  }

  setRefreshToken(refreshToken): void {
    setRefreshLocalStorage(refreshToken);
  }

  getToken(): void {
    const token = getTokenLocalStorage();
    if (token) {
      this.token = token;
    }
  }

  toggleHeader(newValue: boolean): void {
    this.isHeaderOpened = newValue;
  }
}
