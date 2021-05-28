import {
  IRouteCalculateForm,
  IRouteCalculateResponse,
  IRouteCreateForm,
  IRouteCreateResponse,
} from '../models/types';

import Api from 'api/Api';

export default class RoutesGeneratorApi {
  static calculateRoute(data: IRouteCalculateForm): Promise<IRouteCalculateResponse> {
    return Api.post(data, '/api/v1/routes/calculate');
  }

  static createRoute(data: IRouteCreateForm): Promise<IRouteCreateResponse> {
    return Api.post(data, '/api/v1/routes');
  }
}
