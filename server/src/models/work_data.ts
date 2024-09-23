import { IReqHeaders } from '@/types/types';

export interface WorkDataModel {
  id: number;
  userToken: string;
  rootKey: string;
  content: string;
  created_at: string;
}

export interface SyncWorkDataReq extends IReqHeaders {
  rootKey: string;
  content: string;
}
