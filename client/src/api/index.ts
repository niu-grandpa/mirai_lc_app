import net from '@/config/net';
import { message } from 'ant-design-vue';
import axios, { type AxiosRequestConfig } from 'axios';

const createRequest = () => {
  const _axios = axios;

  _axios.interceptors.request.use(v => Object.assign(net, v));

  _axios.interceptors.response.use(v => {
    if (v.status !== 200) {
      message.error('接口请求出错');
    } else if (process.env.NODE_ENV === 'development') {
      console.log('response: ', v.data);
    }
    return v;
  });

  return <T>(config: AxiosRequestConfig) => {
    return new Promise<{ data: T }>(async (resolve, reject) => {
      try {
        const { data } = await _axios(config);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  };
};

export const request = createRequest();
