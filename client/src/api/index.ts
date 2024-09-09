import net from '@/config/net';
import { message } from 'ant-design-vue';
import axios, { type Axios, type AxiosRequestConfig } from 'axios';

const createRequest = () => {
  const _axios = axios;

  _axios.interceptors.request.use(
    v => {
      if (v.method === 'GET' || v.method === 'DELETE') {
        v.params = Object.assign(v.data, v.params);
        v.data = {};
      }
      return Object.assign(net, v);
    },
    err => {
      message.error('网络请求错误');
      return Promise.reject(err);
    }
  );

  _axios.interceptors.response.use(
    res => {
      if (process.env.NODE_ENV === 'development') {
        console.log('response: ', res.data);
      }
      return res;
    },
    err => {
      message.error('服务器错误，请稍后再试。');
      return Promise.reject(err);
    }
  );

  return <T>(config: AxiosRequestConfig) => {
    return new Promise<{ data: T }>(async (resolve, reject) => {
      try {
        const method = config.method?.toLowerCase() as keyof typeof Axios;
        const { data } = await _axios[method](config.url, config.data);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  };
};

export const request = createRequest();
