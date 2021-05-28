import {
  getRefreshLocalStorage,
  getTokenLocalStorage,
  setRefreshLocalStorage,
  setTokenLocalStorage,
} from 'helpers/token';

import HTTPStatus from 'http-status';
import { IGenResponseAxios } from './types';
import axios from 'axios';
import { removeTokenLocalStorage } from 'helpers/token';
import { routerStore } from 'modules/common/containers/App';

export default class Api {
  static host = '';
  static serviceUrl = '';

  static loadingRefreshToken = false;

  static getHeaders = (extendHeaders = {}, token: string = getTokenLocalStorage()) => {
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };

    Object.keys(extendHeaders).forEach((key) => {
      headers[key] = extendHeaders[key];
    });
    return headers;
  };

  static getReject = (reject, error) => {
    if (
      (error.response.config.method === 'get' || error.response.config.method === 'post') &&
      (error.response.status === HTTPStatus.NOT_FOUND ||
        error.response.status === HTTPStatus.METHOD_NOT_ALLOWED ||
        error.response.status === HTTPStatus.REQUEST_TIMEOUT ||
        error.response.status === HTTPStatus.CONFLICT ||
        error.response.status === HTTPStatus.INTERNAL_SERVER_ERROR ||
        error.response.status === HTTPStatus.BAD_GATEWAY ||
        error.response.status === HTTPStatus.FORBIDDEN)
    ) {
      const response = {
        status: error.response.status,
        data: error.response.data,
      };
      routerStore.replace({ pathname: '/error', state: response });
      return reject(error.response);
    }

    if (error.response.status !== HTTPStatus.UNAUTHORIZED) {
      return reject(error.response);
    }

    const tokens = {
      token: getTokenLocalStorage(),
      refreshToken: getRefreshLocalStorage(),
    };

    if (tokens.token && tokens.refreshToken) {
      if (!Api.loadingRefreshToken) {
        Api.loadingRefreshToken = true;
        axios
          .post(`${Api.host}/api/v1/auth/refresh`, { token: tokens.refreshToken })
          .then((response) => {
            setTokenLocalStorage(response.data.data.token);
            setRefreshLocalStorage(response.data.data.refresh);
            Api.loadingRefreshToken = false;

            window.location.reload();
          })
          // eslint-disable-next-line no-shadow
          .catch((error) => {
            Api.loadingRefreshToken = false;
            if (error.response.status === HTTPStatus.UNAUTHORIZED) {
              removeTokenLocalStorage();

              window.location.href = '/login';
            }
            return Promise.reject(error.response);
          });
      }
    } else {
      removeTokenLocalStorage();
      return reject(error.response);
    }
  };

  static get = <T>(endpoint = '/', query = {}, baseUrl = Api.host): Promise<IGenResponseAxios<T>> =>
    new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get(`${baseUrl}${endpoint}`, {
          headers: Api.getHeaders(),
          params: {
            ...query,
          },
        });
        const { data, headers } = response;
        resolve({ headers, data });
      } catch (error) {
        Api.getReject(reject, error);
      }
    });

  static post = <T>(
    body,
    endpoint = '',
    query = {},
    baseUrl = Api.host,
  ): Promise<IGenResponseAxios<T>> =>
    new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(`${baseUrl}${endpoint}`, body, {
          headers: Api.getHeaders(),
          params: {
            ...query,
          },
        });
        const { headers, data } = response;
        resolve({ data, headers });
      } catch (error) {
        Api.getReject(reject, error);
      }
    });

  static login = <T>(
    body,
    endpoint = '',
    query = {},
    baseUrl = Api.host,
  ): Promise<IGenResponseAxios<T>> =>
    new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(`${baseUrl}${endpoint}`, body, {
          headers: Api.getHeaders(),
          params: {
            ...query,
          },
        });
        const { headers, data } = response;
        resolve({ data, headers });
      } catch (error) {
        reject(error.response);
      }
    });

  static put = <T>(
    body,
    endpoint = '',
    query = {},
    baseUrl = Api.host,
  ): Promise<IGenResponseAxios<T>> =>
    new Promise(async (resolve, reject) => {
      try {
        const response = await axios.put(`${baseUrl}${endpoint}`, body, {
          headers: Api.getHeaders(),
          params: {
            ...query,
          },
        });
        const { headers, data } = response;
        resolve({ data, headers });
      } catch (error) {
        Api.getReject(reject, error);
      }
    });

  static patch = <T>(
    body,
    endpoint = '/',
    query = {},
    baseUrl = Api.host,
  ): Promise<IGenResponseAxios<T>> =>
    new Promise(async (resolve, reject) => {
      try {
        const response = await axios.patch(`${baseUrl}${endpoint}`, body, {
          headers: Api.getHeaders(),
          params: {
            ...query,
          },
        });
        const { headers, data } = response;
        resolve({ data, headers });
      } catch (error) {
        Api.getReject(reject, error);
      }
    });

  static delete = <T>(endpoint = '/', baseUrl = Api.host): Promise<IGenResponseAxios<T>> =>
    new Promise(async (resolve, reject) => {
      try {
        const response = await axios.delete(`${baseUrl}${endpoint}`, {
          headers: Api.getHeaders(),
        });
        const { headers, data } = response;
        resolve({ data, headers });
      } catch (error) {
        Api.getReject(reject, error);
      }
    });
}
