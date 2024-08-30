import { type TreeDataCommonType } from '@/share/abstractNode';
import { DOWNLOAD_FILE_TYPE } from '@/share/enums';
import { request } from '.';

enum URL {
  DOWNLOAD_FILE = '/download/file',
  DOWNLOAD_PROJECT = '/download/project',
}

export const downloadFile = async (data: {
  type: DOWNLOAD_FILE_TYPE;
  node: TreeDataCommonType;
}): Promise<string> => {
  const { data: url } = await request<string>({
    url: URL.DOWNLOAD_FILE,
    method: 'POST',
    data,
  });
  return url;
};

export const downloadProject = async (data: {
  type: DOWNLOAD_FILE_TYPE;
  node: TreeDataCommonType;
}): Promise<string> => {
  const { data: url } = await request<string>({
    url: URL.DOWNLOAD_PROJECT,
    method: 'POST',
    data,
  });
  return url;
};
