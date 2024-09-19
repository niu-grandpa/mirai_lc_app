import { downloadFile, downloadProject } from '@/api/download';
import { readWorkFile } from '@/api/upload';
import commonConfig from '@/config/common';
import { useTreeManager } from '@/hooks';
import { getLocalItem, setLocalItem } from '@/share';
import { DOWNLOAD_FILE_TYPE } from '@/share/enums';
import { message } from 'ant-design-vue';
import { defineStore } from 'pinia';
import { useCommonStore } from './commonStore';
import { useWorkspaceStore } from './workspaceStore';

export interface NodeManagerStore {
  _selectedKeys: string[];
  _expandedKeys: string[];
}

const treeManager = useTreeManager();

const { storageKeys } = commonConfig;

export const useNodeManagerStore = defineStore('nodeManager', {
  state: (): NodeManagerStore => ({
    _selectedKeys: [],
    _expandedKeys: [],
  }),

  getters: {
    commonStore: () => useCommonStore(),
    workspaceStore: () => useWorkspaceStore(),
    selectedKeys: state => state._selectedKeys,
    expandedKeys: state => state._expandedKeys,
  },

  actions: {
    updateSelectedKeys(value?: string[]) {
      const keys =
        value ||
        getLocalItem<string[]>(storageKeys.SELECTED_KEYS) ||
        [...this.workspaceStore.openedFileKeys][0] ||
        [];
      this._selectedKeys = keys;
      setLocalItem(storageKeys.SELECTED_KEYS, keys);
    },

    updateExpandedKeys(value?: string[]) {
      const _value = value || getLocalItem(storageKeys.EXPANED_KEYS) || [];
      this._expandedKeys = _value;
      setLocalItem(storageKeys.EXPANED_KEYS, _value);
    },

    removeNodes(keys: string[]) {
      const data = treeManager.setData(this.workspaceStore.workData);
      const newKeys = this.selectedKeys.filter(k => !keys.includes(k));
      keys.forEach(k => data.removeOneNode(k));
      this.updateSelectedKeys(newKeys);
      data.freed();
    },

    async pasteNode(targetKey: string, keys: string[]) {
      await treeManager
        .setData(this.workspaceStore.workData)
        .pasteNode(targetKey, keys);
      treeManager.freed();
    },

    dragNode<T>(info: T) {
      treeManager.setData(this.workspaceStore.workData).dragNode(info);
      treeManager.freed();
    },

    async exportToFile(
      type: DOWNLOAD_FILE_TYPE,
      key: string,
      isProject = false
    ) {
      try {
        this.commonStore.setLoading(true);

        const node = treeManager
          .setData(this.workspaceStore.workData)
          .findNode(key);
        const link = document.createElement('a');
        const data = { type, node };

        const url = isProject
          ? await downloadProject(data)
          : await downloadFile(data);

        message.success('导出成功');
        document.body.appendChild(link);

        link.href = `${import.meta.env.PUBLIC_PROXY}${url}`;
        link.download = url.split('/').pop()!;
        link.click();

        document.body.removeChild(link);
      } finally {
        this.commonStore.setLoading(false);
      }
    },

    async importWorkFile(file: File, key: string) {
      const data = await readWorkFile(file);
      this.workspaceStore.addNode(key, data);
    },
  },
});
