export interface DownloadModel {
  id: string;
  link: string;
}

export enum DOWNLOAD_FILE_TYPE {
  VUE = 'VUE',
  HTML = 'HTML',
  JSON = 'JSON',
}

export interface DownloadReq<T> {
  type: DOWNLOAD_FILE_TYPE;
  node: T;
}
