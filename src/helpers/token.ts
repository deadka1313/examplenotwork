import { LOCAL_STORAGE } from 'constants/index';

export const getTokenLocalStorage = (): string => {
  const token = localStorage.getItem(LOCAL_STORAGE.TOKEN);
  return token !== 'undefined' ? token : null;
};

export const getRefreshLocalStorage = (): string => {
  const refreshToken = localStorage.getItem(LOCAL_STORAGE.REFRESH);
  return refreshToken !== 'undefined' ? refreshToken : null;
};

export const setTokenLocalStorage = (token: string): void => {
  localStorage.setItem(LOCAL_STORAGE.TOKEN, token);
};

export const setRefreshLocalStorage = (refresh: string): void => {
  localStorage.setItem(LOCAL_STORAGE.REFRESH, refresh);
};

export const removeTokenLocalStorage = (): void => {
  localStorage.removeItem(LOCAL_STORAGE.TOKEN);
  localStorage.removeItem(LOCAL_STORAGE.REFRESH);
};

export const getProfileGUIDFromToken = (token: string): string => {
  const secondPart = token.split('.')[1];
  const secondPartData = JSON.parse(atob(secondPart));
  return secondPartData.jti;
};
