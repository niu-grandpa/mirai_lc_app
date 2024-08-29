export interface DownloadModel {
  file_key: string;
  link: string;
  expiration_time: number;
}

enum DOWNLOAD_FILE_TYPE {
  VUE = 'VUE',
  HTML = 'HTML',
  JSON = 'JSON',
}

export interface DownloadReq<T> {
  type: DOWNLOAD_FILE_TYPE;
  node: T;
}
