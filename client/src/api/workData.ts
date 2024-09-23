import { FolderANode } from '@/share/abstractNode';
import { request } from '.';

interface AllOfWorkData {
  userToken: string;
  rootKey: string;
  content: string;
  created_at: string;
}

export const getWorkData = async (): Promise<FolderANode[]> => {
  const { data } = await request<AllOfWorkData[]>({
    method: 'GET',
    url: '/work-data/all',
  });
  return data.map(({ content }) => JSON.parse(content));
};

export const syncWorkData = async (rootKey: string, content: string) => {
  await request<AllOfWorkData[]>({
    method: 'PUT',
    url: '/work-data/sync',
    data: { rootKey, content },
  });
};
