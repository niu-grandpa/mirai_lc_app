import { getLocalItem } from '@/share';
import { type AxiosRequestConfig } from 'axios';
import common from './common';

export default {
  method: 'GET',
  timeout: 10000,
  withCredentials: true,
  responseType: 'json',
  withXSRFToken: true,
  headers: {
    Authorization: getLocalItem(common.storageKeys.USER_TOKEN),
    'Content-Type': 'application/json',
  },
  baseURL: `${import.meta.env.PUBLIC_PROXY}${
    import.meta.env.PUBLIC_API_PREFIX
  }`,
} as AxiosRequestConfig;
