import {
  getWorkData,
  syncWorkData,
  type GetWorkDataRep,
  type SyncWorkDataReq,
} from '@/api/workData';
import commonConfig from '@/config/common';
import { type CreateANodeOptions } from '@/core/tree-manager/handler';
import { useTreeManager } from '@/hooks';
import { getLocalItem, setLocalItem } from '@/share';
import {
  type ElementANode,
  type FileANode,
  type FolderANode,
  type TreeDataCommonType,
} from '@/share/abstractNode';
import { defineStore } from 'pinia';
import { useCommonStore } from './commonStore';
import { useUserStore } from './userStore';

export interface WorkspaceState {
  _workData: FolderANode[];
  _openedFileKeys: Set<string>;
  _openedFiles: Set<FileANode>;
}

const treeManager = useTreeManager();

const { storageKeys } = commonConfig;

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    _workData: [],
    _openedFileKeys: new Set(),
    _openedFiles: new Set(),
  }),

  getters: {
    commonStore: () => useCommonStore(),
    userStore: () => useUserStore(),
    workData: state => state._workData,
    openedFileKeys: state => state._openedFileKeys,
    openedFiles: state => state._openedFiles,
  },

  actions: {
    async initData(): Promise<FolderANode[]> {
      const localData = getLocalItem<GetWorkDataRep>(storageKeys.WORK_DATA);
      let value: FolderANode[] = localData.data;

      if (this.userStore.isVip) {
        const coludData = await getWorkData(this.userStore.account);
        // 如果云端数据比本地的新，则更新本地数据
        if (coludData.saveTime > localData.saveTime) {
          value = coludData.data;
        } else {
          // 反之，更新云端数据
          await this.updateWorkData(value, { saveToLocal: false });
        }
      }

      value = treeManager.setData(value).sortNodes();
      this.updateWorkData(value);
      treeManager.freed();

      return value;
    },

    async updateWorkData(
      data?: FolderANode[],
      options: {
        saveToLocal?: boolean;
        saveToCould?: boolean;
      } = {
        saveToLocal: true,
        saveToCould: false,
      }
    ) {
      if (data) {
        this._workData = data;
      }

      const params: SyncWorkDataReq = {
        account: this.userStore.account,
        saveTime: Date.now(),
        data: this.workData,
      };

      if (options.saveToLocal) {
        setLocalItem(storageKeys.WORK_DATA, params);
      }
      if (this.userStore.isVip && options.saveToCould) {
        await syncWorkData(params);
      }
    },

    findOneNode(key: string) {
      const node = treeManager.setData(this.workData).findNode(key);
      return node as FolderANode & FileANode & ElementANode;
    },

    findKeysByName(name: string): string[] {
      return treeManager.setData(this.workData).findKeysByName(name);
    },

    async createAndInsertNode(opts: CreateANodeOptions) {
      await treeManager.setData(this.workData).createAndInsertNode(opts);
    },

    updateNode(key: string, value: object) {
      treeManager.setData(this.workData).updateOneNode(key, value);
    },

    removeNode(key: string) {
      treeManager.setData(this.workData).removeOneNode(key);
      treeManager.freed();
    },

    addNode(key: string, node: TreeDataCommonType) {
      treeManager.setData(this.workData).addOneNode(key, node);
    },

    initOpenedFileKeys() {
      this._openedFileKeys = new Set(getLocalItem(storageKeys.OPENED_KEYS));
      this.setOpenedFileKeys();
    },

    setOpenedFileKeys() {
      setLocalItem(storageKeys.OPENED_KEYS, [...this.openedFileKeys]);
    },

    getOpenedFiles(): Set<FileANode> {
      const list = new Set<FileANode>();
      this.openedFileKeys.forEach(key => {
        const node = this.findOneNode(key);
        if (node && !node.isFolder) {
          list.add(node);
        }
      });
      return list;
    },

    updateOpenedFilesByKeys(method: 'add' | 'delete', key: string | string[]) {
      if (!key || !key.length) return;
      if (Array.isArray(key)) {
        key.forEach(k => {
          this._openedFileKeys[method](k);
        });
      } else {
        this._openedFileKeys[method](key);
      }
      this._openedFiles = this.getOpenedFiles();
      this.setOpenedFileKeys();
    },
  },
});
