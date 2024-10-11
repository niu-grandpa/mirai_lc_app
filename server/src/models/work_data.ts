import { IReqHeaders } from '@/types/types';

export interface WorkDataModel {
  userId: number;
  saveTime: number;
  data: string;
  created_at: string;
}

export interface SyncWorkDataReq extends IReqHeaders {
  saveTime: number;
  data: string;
  account: number;
}
