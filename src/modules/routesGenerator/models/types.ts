import {
  IApiResponseErrorMD2,
  IApiResponsePaginationMD2,
  IGenApiResponseMD2,
  IGenResponseAxios,
} from 'api/types';

import { ICoverage } from 'modules/coverages/models/types';
import { IProfile } from 'modules/user/models/types';
import { IRoute } from 'modules/routes/models/types';
import { ITasks } from 'modules/tasks/models/types';
import { ITransports } from 'modules/transports/models/types';
import { IWarehouses } from 'modules/warehouses/models/types';
import moment from 'moment';

export interface IRouteSettings {
  warehouses: string[];
  deliveryDate: moment.Moment;
  deliveryMethod: string[];
}

export interface ISettingsData {
  courierGuid?: string;
  sessionGuid?: string;
  time?: moment.Moment;
  transportGuid?: string;
  fullName?: string;
  transport?: ITransports;
  profile?: IProfile;
}

export interface ITaskForCompatibility {
  tasks: ITasks[];
  error: string;
}

export interface INotCoverage {
  guid: string;
  name: string;
}

export interface ITasksGroupCoverage {
  tasks: ITasks[];
  coverage?: INotCoverage | ICoverage;
}

export interface ITasksGroupCoverages {
  [key: string]: ITasksGroupCoverage;
}

export interface IRouteDraft extends ISettingsData {
  tasksList: ITasks[];
  isLoadingCard: boolean;
  isCalculated: boolean;
  error?: string;
  start?: WarehousePreRoute;
  finish?: WarehousePreRoute;
  warehouse?: IWarehouses;
  coverages?: ICoverage[];
}

interface ITaskRouteCreateForm {
  guid: string;
  planned_delivery_time: string;
}

export interface IRouteCreateForm {
  date_time_planned_finish: string;
  date_time_planned_start: string;
  session_guid: string;
  tasks: ITaskRouteCreateForm[];
}

export interface IRouteCreateForm {
  date_time_planned_finish: string;
  date_time_planned_start: string;
  session_guid: string;
  tasks: ITaskRouteCreateForm[];
}

export interface IRouteCalculateForm {
  courier_guid: string;
  task_guids: string[];
  transport_guid: string;
  route_start_time: string;
}

export interface WarehousePreRoute {
  datetime: string;
  warehouse: IWarehouses;
}

export interface ICalculatedPreRoute {
  start: WarehousePreRoute;
  finish: WarehousePreRoute;
  task_list: ITasks[];
}

type IRouteCalculateApiResponse = IGenApiResponseMD2<
  ICalculatedPreRoute,
  IApiResponsePaginationMD2,
  IApiResponseErrorMD2
>;

type IRouteCreateApiResponse = IGenApiResponseMD2<
  IRoute,
  IApiResponsePaginationMD2,
  IApiResponseErrorMD2
>;

export type IRouteCalculateResponse = IGenResponseAxios<IRouteCalculateApiResponse>;
export type IRouteCreateResponse = IGenResponseAxios<IRouteCreateApiResponse>;
