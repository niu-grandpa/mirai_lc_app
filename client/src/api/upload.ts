import { request } from '.';
import { WorkDataNodeType } from './workData';

export const readJsonFile = async (
  file: File
): Promise<WorkDataNodeType | WorkDataNodeType[]> => {
  const data = new FormData();
  data.append('readJsonFile', file);

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
