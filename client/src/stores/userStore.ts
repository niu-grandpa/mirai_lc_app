import {
  type RegisterUser,
  type UpdateUserProfile,
  updateUserProfile,
  userDestory,
  userLogin,
  type UserLoginReq,
  type UserLoginResp,
  userLogout,
  userRegister,
} from '@/api/user';
import commonConfig from '@/config/common';
import { getLocalItem, setLocalItem } from '@/share';
import { defineStore } from 'pinia';

const { storageKeys } = commonConfig;

const defaultData = {
  _id: 0,
  _token: getLocalItem(storageKeys.USER_TOKEN),
  _phoneNumber: '',
  _avatar: '',
  _isVip: false,
  _nickname: '',
  _vipExpiration: 0,
};

export const useUserStore = defineStore('user', {
  state: () => defaultData,

  getters: {
    uid: state => state._id,
    token: state => state._token,
    isVip: state => state._isVip,
    avatar: state => state._avatar,
    nickname: state => state._nickname,
    phoneNumber: state => state._phoneNumber,
  },

  actions: {
    initData() {
      this.setToken('');
      this.$state = defaultData;
    },

    setData(data: UserLoginResp) {
      Object.entries(data).forEach(([k, v]) => {
        const key = `_${k}`;
        if (key in this.$state) {
          // @ts-ignore
          this.$state[key] = v;
        }
      });
      this.setToken();
    },

    setToken(token?: string) {
      const val = token || this.token;
      this._token = val;
      setLocalItem(storageKeys.USER_TOKEN, val);
    },

    async login(data?: UserLoginReq & { remember: boolean }) {
      const res = await userLogin(data);
      this.setData(res);
      if (!data?.remember) {
        this.setToken('');
      }
    },

    async register(data: RegisterUser) {
      this.setData(await userRegister(data));
    },

    async logout() {
      await userLogout();
      this.initData();
    },

    async destory() {
      await userDestory(this.uid, this.phoneNumber);
      this.initData();
    },

    async updateProfile(data: UpdateUserProfile) {
      await updateUserProfile(data);
    },
  },
});
