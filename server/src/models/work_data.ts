import { IReqHeaders } from '@/types/types';

export interface WorkDataModel {
  account: number;
  saveTime: number;
  data: string;
  created_at: string;
}

export interface SyncWorkDataReq extends IReqHeaders {
  saveTime: number;
  data: string;
  account: number;
}
