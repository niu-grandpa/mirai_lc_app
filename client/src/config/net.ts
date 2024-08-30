import { getLocalItem } from '@/share';
import { type AxiosRequestConfig } from 'axios';

export default {
  method: 'GET',
  timeout: 10000,
  headers: {
    Authorization: getLocalItem('USER_TOKEN'),
  },
  baseURL: `${import.meta.env.PUBLIC_PROXY}${
    import.meta.env.PUBLIC_API_PREFIX
  }`,
} as AxiosRequestConfig;
