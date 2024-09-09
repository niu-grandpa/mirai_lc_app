import { downloadFile, downloadProject } from '@/api/download';
import { readWorkFile } from '@/api/upload';
import { type CreateANodeOptions } from '@/core/tree-manager/handler';
import { useTreeManager } from '@/hooks';
import { getLocalItem, setLocalItem } from '@/share';
import {
  type ElementANode,
  type FileANode,
  type FolderANode,
  type TreeDataCommonType,
} from '@/share/abstractNode';
import { DOWNLOAD_FILE_TYPE, LOCAL_ITEM_KEY } from '@/share/enums';
import { message } from 'ant-design-vue';
import { defineStore } from 'pinia';
import { useCommonStore } from './commonStore';
import mockTreeData from './mock_data.json';

export interface WorkspaceState {
  _selectedKey: string[];
  _openedKeys: Set<string>;
  _expandedKeys: string[];
  _treeData: FolderANode[];
  _openedNodes: Set<FileANode>;
}

const treeManager = useTreeManager();

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    _treeData: [],
    _selectedKey: [],
    _expandedKeys: [],
    _openedKeys: new Set(),
    _openedNodes: new Set(),
  }),

  getters: {
    commonStore: () => useCommonStore(),
    treeData: state => state._treeData,
    selectedKey: state => state._selectedKey,
    openedKeys: state => state._openedKeys,
    expandedKeys: state => state._expandedKeys,
    openedNodes: state => state._openedNodes,
  },

  actions: {
    getLocalData() {
      const data =
        getLocalItem<TreeDataCommonType[]>(LOCAL_ITEM_KEY.FILE_DATA) ||
        mockTreeData.treeData;
      this._treeData = treeManager.setData(data).sortNodes();
      treeManager.freed();
    },

    updateData(value: FolderANode[]) {
      const newData = treeManager.setData(value).sortNodes();
      treeManager.freed();
      this._treeData = newData;
      setLocalItem(LOCAL_ITEM_KEY.FILE_DATA, newData);
    },

    initOpenedKeys() {
      this._openedKeys = new Set(getLocalItem(LOCAL_ITEM_KEY.OPENED_KEYS));
      this.setOpenedKeys();
    },

    setOpenedKeys() {
      setLocalItem(LOCAL_ITEM_KEY.OPENED_KEYS, [...this.openedKeys]);
    },

    getOpenedFileANodes(): Set<FileANode> {
      const list = new Set<FileANode>();
      this.openedKeys.forEach(key => {
        const node = this.findOneNode(key);
        if (node && !node.isFolder) {
          list.add(node);
        }
      });
      return list;
    },

    updateOpenedFileANodes(method: 'add' | 'delete', key: string | string[]) {
      if (!key || !key.length) return;
      if (Array.isArray(key)) {
        key.forEach(k => {
          this._openedKeys[method](k);
        });
      } else {
        this._openedKeys[method](key);
      }
      this._openedNodes = this.getOpenedFileANodes();
      this.setOpenedKeys();
    },

    updateSelectedKey(value?: string[]) {
      const keys =
        value ||
        getLocalItem<string[]>(LOCAL_ITEM_KEY.SELECTED_KEYS) ||
        [...this._openedKeys][0] ||
        [];
      this._selectedKey = keys;
      setLocalItem(LOCAL_ITEM_KEY.SELECTED_KEYS, keys);
    },

    updateExpandedKeys(value?: string[]) {
      const _value = value || getLocalItem(LOCAL_ITEM_KEY.EXPANED_KEYS) || [];
      this._expandedKeys = _value;
      setLocalItem(LOCAL_ITEM_KEY.EXPANED_KEYS, _value);
    },

    findOneNode(key: string) {
      const node = treeManager.setData(this.treeData).findNode(key);
      return node as FolderANode & FileANode & ElementANode;
    },

    findKeysByName(name: string): string[] {
      return treeManager.setData(this.treeData).findKeysByName(name);
    },

    async createAndInsertNode(opts: CreateANodeOptions) {
      await treeManager.setData(this.treeData).createAndInsertNode(opts);
      this.updateData(this.treeData);
    },

    updateOneNode(key: string, value: Partial<TreeDataCommonType>) {
      treeManager.setData(this.treeData).updateOneNode(key, value);
      this.updateData(this.treeData);
    },

    addOneNode(key: string, node: TreeDataCommonType) {
      treeManager.setData(this.treeData).addOneNode(key, node);
      this.updateData(this.treeData);
    },

    removeNode(keys: string[]) {
      const data = treeManager.setData(this.treeData);
      const newKeys = this.selectedKey.filter(k => !keys.includes(k));
      keys.forEach(k => data.removeOneNode(k));
      this.updateSelectedKey(newKeys);
      this.updateData(this.treeData);
      data.freed();
    },

    pasteNode(targetKey: string, keys: string[]) {
      const newData = treeManager
        .setData(this.treeData)
        .pasteNode(targetKey, keys)
        .getData();
      this.updateData(newData);
      treeManager.freed();
    },

    dragNode<T>(info: T) {
      const newData = treeManager.setData(this.treeData).dragNode(info);
      this.updateData(newData);
      treeManager.freed();
    },

    async download(type: DOWNLOAD_FILE_TYPE, key: string, isProject = false) {
      try {
        this.commonStore.setLoading(true);

        const node = treeManager.setData(this.treeData).findNode(key);
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

    async uploadAndAddNodes(file: File, key: string) {
      const data = await readWorkFile(file);
      this.addOneNode(key, data);
    },
  },
});
