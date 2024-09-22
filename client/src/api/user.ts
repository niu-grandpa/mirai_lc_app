import { request } from '.';

export type UserLoginReq = {
  phoneNumber: string;
  password: string;
};

export type RegisterUser = {
  phoneNumber: string;
  code: string;
  password: string;
  nickname: string;
};

export type UpdateUserProfile = {
  avatar?: string;
  nickname?: string;
  password?: string;
};

export const userRegister = async (data: RegisterUser): Promise<string> => {
  const { data: token } = await request<string>({
    method: 'POST',
    url: '/user/register',
    data,
  });
  return token;
};

export const userLogin = async (data?: UserLoginReq): Promise<string> => {
  const { data: token } = await request<string>({
    method: 'GET',
    url: '/user/login',
    data,
  });
  return token;
};

export const userLogout = async () => {
  await request({
    method: 'POST',
    url: '/user/logout',
  });
};

export const userDestory = async (phoneNumber: string) => {
  await request({
    method: 'DELETE',
    url: '/user/destory',
    data: {
      phoneNumber,
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
