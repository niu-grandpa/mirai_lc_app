import { getLocalItem } from '@/share';
import { type AxiosRequestConfig } from 'axios';

export default {
  method: 'GET',
  timeout: 10000,
  withCredentials: true,
  responseType: 'json',
  withXSRFToken: true,
  headers: {
    Authorization: getLocalItem('USER_TOKEN'),
    'Content-Type': 'application/json',
  },
  baseURL: `${import.meta.env.PUBLIC_PROXY}${
    import.meta.env.PUBLIC_API_PREFIX
  }`,
} as AxiosRequestConfig;
