import { IApiResponsePaginationMD2, IPagination } from 'api/types';

export const isOutOfPages = (pagination: IApiResponsePaginationMD2): boolean =>
  pagination &&
  pagination.page !== 1 &&
  pagination.page > Math.ceil(pagination.total / pagination.page_size);

export const getLastPagePagination = (pagination: IApiResponsePaginationMD2): IPagination => ({
  current: Math.ceil(pagination.total / pagination.page_size) || 1,
  pageSize: pagination.page_size,
  total: null,
});

export const getResponsePagination = (pagination: IApiResponsePaginationMD2): IPagination => ({
  current: pagination.page,
  pageSize: pagination.page_size,
  total: pagination.total,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reduceItemGUID = (acc, item): any => {
  const prevItem = acc[item.guid] || {};
  return {
    ...acc,
    [item.guid]: {
      ...prevItem,
      ...item,
    },
  };
};
