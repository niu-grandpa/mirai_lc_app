import { type CreateANodeOptions } from '@/core/tree-manager/handler';
import { useTreeManager } from '@/hooks';
import { getLocalItem, setLocalItem } from '@/share';
import {
  type ElementANode,
  type FileANode,
  type FolderANode,
  type TreeDataCommonType,
} from '@/types/abstractNode';
import { defineStore } from 'pinia';

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
    treeData: state => state._treeData,
    selectedKey: state => state._selectedKey,
    openedKeys: state => state._openedKeys,
    expandedKeys: state => state._expandedKeys,
    openedNodes: state => state._openedNodes,
  },

  actions: {
    async fetchTreeData(value: FolderANode[]) {
      // TODO 调用api接口
      this._treeData = treeManager.setData(value).sortNodes();
      treeManager.freed();
    },

    initOpenedKeys() {
      this._openedKeys = new Set(getLocalItem('openedKeys'));
      this.setOpenedKeys();
    },

    setOpenedKeys() {
      setLocalItem('openedKeys', [...this.openedKeys]);
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
        getLocalItem<string[]>('selectedKey') ||
        [...this._openedKeys][0] ||
        [];
      this._selectedKey = keys;
      setLocalItem('selectedKey', keys);
    },

    updateExpandedKeys(value: string[]) {
      this._expandedKeys = value || getLocalItem('expandedKeys');
      setLocalItem('expandedKeys', this._expandedKeys);
    },

    findOneNode(key: string) {
      const node = treeManager.setData(this.treeData).findNode(key);
      return node as FolderANode & FileANode & ElementANode;
    },

    findKeysByName(name: string): string[] {
      return treeManager.setData(this.treeData).findKeysByName(name);
    },

    async updateTreeData(value: FolderANode[]) {
      const newData = treeManager.setData(value).sortNodes();
      treeManager.freed();
      // TODO 调用api接口
      this._treeData = newData;
    },

    async createAndInsertNode(opts: CreateANodeOptions) {
      const newNode = treeManager
        .setData(this.treeData)
        .createAndInsertNode(opts);
      // TODO 调用api接口
    },

    async updateOneNode(key: string, value: Partial<TreeDataCommonType>) {
      // TODO 调用api接口
      treeManager.setData(this.treeData).updateOneNode(key, value);
    },

    async addOneNode(key: string, node: TreeDataCommonType) {
      // TODO 调用api接口
      treeManager.setData(this.treeData).addOneNode(key, node);
    },

    async removeNode(keys: string[]) {
      // TODO 调用api接口
      const data = treeManager.setData(this.treeData);
      const newKeys = this.selectedKey.filter(k => !keys.includes(k));
      keys.forEach(k => data.removeOneNode(k));
      data.freed();
      this.updateSelectedKey(newKeys);
    },

    async pasteNode(targetKey: string, keys: string[]) {
      const newData = treeManager
        .setData(this.treeData)
        .pasteNode(targetKey, keys)
        .getData();
      // TODO 调用api接口
      treeManager.freed();
    },

    async dragNode<T>(info: T) {
      const newData = treeManager.setData(this.treeData).dragNode(info);
      this.updateTreeData(newData);
      treeManager.freed();
    },
  },
});
