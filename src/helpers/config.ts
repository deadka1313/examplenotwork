export interface IConfig {
  debug: number;
  host: string;
  hostMD2: string;
  route: IConfigRoute;
  tile: IConfigTile[];
  geocoderBMP: IConfigGeocoderBMP;
  geocoderYandex: IConfigGeocoderYandex;
}

export type IConfigRoute = {
  serviceUrl: string;
};

export interface IConfigGeocoderBMP {
  url: string;
  token: string;
}

export interface IConfigGeocoderYandex {
  params: IConfigGeocoderYandexParams;
  url: string;
}

export interface IConfigGeocoderYandexParams {
  apikey?: string;
  format?: string;
}

export interface IConfigTile {
  params: IConfigTileParams;
  url: string;
}

export interface IConfigTileParams {
  attribution?: string;
}
