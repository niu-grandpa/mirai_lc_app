export interface UserModel {
  token: string;
  is_vip: boolean;
  email: string;
  password: string;
  nickname: string;
  created_at?: number;
  avatar_url: string;
}

export interface RegisterUser {
  email: string;
  password: string;
  nickname: string;
}

export interface GenANodeKey {
  prefix: string;
  suffix: string;
}
