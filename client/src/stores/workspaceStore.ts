import { type CreateANodeOptions } from '@/core/tree-manager/handler';
import { useTreeManager } from '@/hooks';
import { getLocalItem, setLocalItem } from '@/share';
import {
  type ElementANode,
  type FileANode,
  type FolderANode,
  type TreeDataCommonType,
} from '@/share/abstractNode';
import { LOCAL_ITEM_KEY } from '@/share/enums';
import { defineStore } from 'pinia';
import { useCommonStore } from './commonStore';

export interface WorkspaceState {
  _workData: FolderANode[];
  _openedFileKeys: Set<string>;
  _openedFiles: Set<FileANode>;
}

const treeManager = useTreeManager();

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    _workData: [],
    _openedFileKeys: new Set(),
    _openedFiles: new Set(),
  }),

  getters: {
    commonStore: () => useCommonStore(),
    workData: state => state._workData,
    openedFileKeys: state => state._openedFileKeys,
    openedFiles: state => state._openedFiles,
  },

  actions: {
    getLocalWorkData() {
      const data = getLocalItem<TreeDataCommonType[]>(LOCAL_ITEM_KEY.FILE_DATA);
      this._workData = treeManager.setData(data).sortNodes();
      treeManager.freed();
    },

    updateWorkData(value: FolderANode[]) {
      const newData = treeManager.setData(value).sortNodes();
      treeManager.freed();
      this._workData = newData;
      setLocalItem(LOCAL_ITEM_KEY.FILE_DATA, newData);
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
      this.updateWorkData(this.workData);
    },

    updateNode(key: string, value: object) {
      treeManager.setData(this.workData).updateOneNode(key, value);
      this.updateWorkData(this.workData);
    },

    removeNode(key: string) {
      treeManager.setData(this.workData).removeOneNode(key);
      this.updateWorkData(treeManager.getData());
      treeManager.freed();
    },

    addNode(key: string, node: TreeDataCommonType) {
      treeManager.setData(this.workData).addOneNode(key, node);
      this.updateWorkData(this.workData);
    },

    initOpenedFileKeys() {
      this._openedFileKeys = new Set(getLocalItem(LOCAL_ITEM_KEY.OPENED_KEYS));
      this.setOpenedFileKeys();
    },

    setOpenedFileKeys() {
      setLocalItem(LOCAL_ITEM_KEY.OPENED_KEYS, [...this.openedFileKeys]);
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
