import { type FolderANode } from '@/share/abstractNode';
import { request } from '.';

export interface GetWorkDataRep {
  userId: number;
  saveTime: number;
  data: FolderANode[];
  created_at: string;
}

export type SyncWorkDataReq = {
  uid: number;
  saveTime: number;
  data: FolderANode[];
};

export const getWorkData = async (uid: number): Promise<GetWorkDataRep> => {
  const { data } = await request<GetWorkDataRep>({
    method: 'GET',
    url: '/work-data/all',
    data: {
      params: { uid },
    },
  });
  return data;
};

export const syncWorkData = async (data: SyncWorkDataReq) => {
  await request({
    method: 'PUT',
    url: '/work-data/sync',
    data,
  });
};
