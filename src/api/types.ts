export interface IGenResponseAxios<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers: any;
  data: T;
}

export interface IPagination {
  current: number;
  pageSize: number;
  total?: number;
}

export interface IGenApiResponseMD2<IData, IPagination, IError> {
  data: IData;
  pagination: IPagination;
  errors: IError[];
}
export interface IApiResponsePaginationMD2 {
  page: number;
  page_size: number;
  total: number;
}

export interface IApiResponseErrorMD2 {
  key: string;
  error: string;
}
