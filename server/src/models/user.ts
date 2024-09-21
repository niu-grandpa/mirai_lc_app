export interface UserModel {
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
  headers: {
    Authorization: string;
  };
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
