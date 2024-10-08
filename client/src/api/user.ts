import { request } from '.';

export type UserLoginReq = {
  account: string;
  phoneNumber: string;
  password: string;
};

export interface UserLoginResp {
  id: number;
  token: string;
  isVip: boolean;
  phoneNumber: string;
  nickname: string;
  password: string;
  createdAt: number;
  avatar: string;
  isLogin: boolean;
  vipExpiration?: number;
}

export type RegisterUser = {
  phoneNumber: string;
  code: string;
  password: string;
  nickname: string;
};

export type UpdateUserProfile = {
  uid: number;
  avatar?: string;
  nickname?: string;
  password?: string;
  newPassword?: string;
};

export const userRegister = async (
  data: RegisterUser
): Promise<UserLoginResp> => {
  const { data: res } = await request<UserLoginResp>({
    method: 'POST',
    url: '/user/register',
    data,
  });
  return res;
};

export const userLogin = async (
  params?: UserLoginReq
): Promise<UserLoginResp> => {
  // @ts-ignore
  delete params?.remember;
  const { data: res } = await request<UserLoginResp>({
    method: 'GET',
    url: '/user/login',
    data: { params },
  });
  return res;
};

export const userLogout = async () => {
  await request({
    method: 'POST',
    url: '/user/logout',
  });
};

export const userDestory = async (uid: number, phoneNumber: string) => {
  await request({
    method: 'DELETE',
    url: '/user/destory',
    data: {
      params: { uid, phoneNumber },
    },
  });
};

export const updateUserProfile = async (data: UpdateUserProfile) => {
  await request({
    method: 'PUT',
    url: '/user/update-profile',
    data,
  });
};

export const sendSmsCode = async (phoneNumber: string) => {
  await request({
    method: 'POST',
    url: '/user/send-verification-code',
    data: { phoneNumber },
  });
};
