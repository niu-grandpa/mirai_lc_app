import { IReqHeaders } from '@/types/types';

export interface UserModel {
  id: number;
  token: string;
  isVip?: boolean;
  phoneNumber: string;
  nickname: string;
  password: string;
  createdAt?: number;
  avatar: string;
  isLogin?: boolean;
  vipExpiration?: number;
}

export interface UserLogin {
  phoneNumber: string;
  password: string;
}

export interface RegisterUser {
  phoneNumber: string;
  code: string;
  password: string;
  nickname: string;
}

export interface GenANodeKey {
  prefix: string;
  suffix: string;
}

export interface UpdateUserProfile extends IReqHeaders {
  uid: number;
  avatar?: string;
  nickname?: string;
  password?: string;
  newPassword?: string;
}
