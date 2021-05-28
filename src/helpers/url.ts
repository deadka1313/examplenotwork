import { IPagination } from 'api/types';

export const getUrlPagination = (pagination = {}, defaultPageSize = 40): IPagination => {
  const url = new URL(window.location.href);

  return {
    ...pagination,
    current: +url.searchParams.get('page') || 1,
    pageSize: +url.searchParams.get('page_size') || defaultPageSize,
  };
};

export const getQueryString = (obj): string => {
  const str = [];
  for (const key in obj)
    if (obj.hasOwnProperty(key) && obj[key]) {
      str.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
    }
  return str.join('&');
};
