import net from '@/config/net';
import { message } from 'ant-design-vue';
import axios, { type Axios, type AxiosRequestConfig } from 'axios';
import deepmerge from 'deepmerge';

const createRequest = () => {
  const _axios = axios;

  _axios.interceptors.request.use(
    // @ts-ignore
    v => deepmerge(net, v),
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
      if (err.status !== 500) {
        message.error(err.response.data.data);
      } else {
        message.error('服务器错误，请稍后再试。');
      }

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
