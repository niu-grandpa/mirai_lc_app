import { type TreeDataCommonType } from '@/share/abstractNode';
import { request } from '.';

export const readWorkFile = async (file: File): Promise<TreeDataCommonType> => {
  const data = new FormData();
  data.append('workFile', file);

  const { data: str } = await request<string>({
    method: 'POST',
    url: '/upload/work-file',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
  });

  return JSON.parse(str);
};
