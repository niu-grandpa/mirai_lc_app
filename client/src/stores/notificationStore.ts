import { getLocalItem, setLocalItem } from '@/share';
import { LOCAL_ITEM_KEY } from '@/share/enums';
import { FolderANode } from '@/types/abstractNode';
import { defineStore } from 'pinia';
import mockData from './mock_data.json';

interface NotificationStore {
  _list: {
    normal: NotificationNormal[];
    download: NotificationDownload[];
  };
}

export interface NotificationNormal {
  title: string;
  content: string;
  createdAt: number;
}

export interface NotificationDownload {
  url: string;
  title: string;
  /** 0 | 成功，1 | 失败，2 | 进行中*/
  status: 0 | 1 | 2;
  data: FolderANode | null;
  createdAt: number;
  endTime: number;
}

export type NotificationType = 'normal' | 'download';

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationStore => ({
    _list: {
      normal: [],
      download: [],
    },
  }),

  getters: {
    list: state => state._list,
  },

  actions: {
    initData() {
      const list =
        getLocalItem<NotificationStore['_list']>(LOCAL_ITEM_KEY.NOTIFICATION) ||
        mockData.noticeList;
      if (list) {
        this._list = list;
      }
    },

    createOneNormal(title: string) {
      const data = {
        title,
        content: '',
        createdAt: Date.now(),
      };
      this.addOne('normal', data);
    },

    createOneDownload(title: '') {
      const data = {
        url: '',
        title,
        status: 2,
        data: null,
        createdAt: Date.now(),
        endTime: 0,
      };
      this.addOne('download', data);
    },

    addOne(key: NotificationType, value: any) {
      this._list[key].unshift(value);
      setLocalItem(LOCAL_ITEM_KEY.NOTIFICATION, this._list);
    },

    updateOne(key: NotificationType, value: any) {
      this._list[key].forEach(item => {
        if (item.createdAt === value.createdAt) {
          item = value;
        }
      });
      setLocalItem(LOCAL_ITEM_KEY.NOTIFICATION, this.list);
    },

    removeOne(key: NotificationType, createdAt: number) {
      const newList = this.list[key].filter(
        item => item.createdAt !== createdAt
      );
      // @ts-ignore
      this._list[key] = newList;
      setLocalItem(LOCAL_ITEM_KEY.NOTIFICATION, newList);
    },
  },
});
