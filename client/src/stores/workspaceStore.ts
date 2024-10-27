import { readJsonFile } from '@/api/upload';
import {
  DataExportType,
  type FileConentNode,
  type FileNode,
  type FolderNode,
  type FolderOrFileNodeType,
  getExportFileUrl,
  getWorkData,
  type GetWorkDataRep,
  syncWorkData,
  type SyncWorkDataReq,
  WorkDataNodeType,
} from '@/api/workData';
import commonConfig from '@/config/common';
import { downloadFile, getLocalItem, setLocalItem } from '@/share';
import { VISUAL_CLASS_NAME } from '@/share/enums';
import workSpaceNodeUtils, {
  type Drag1Callback,
} from '@/share/workSpaceNodeUtils';
import { type AntTreeNodeDropEvent } from 'ant-design-vue/es/tree';
import { defineStore } from 'pinia';
import { useCommonStore } from './commonStore';
import { useUserStore } from './userStore';

export interface WorkspaceState {
  /** 记录操作节点的轨迹，用于操作撤销或恢复 */
  _track: [];
  _workData: FolderNode[];
  _selectedFileNodeKeys: string[];
  _expandedFileNodeKeys: string[];
  _openedFileNodeKeys: Set<string>;
  _openedFiles: Set<FileNode>;
}

const { storageKeys } = commonConfig;

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    _track: [],
    _workData: [],
    _selectedFileNodeKeys: [],
    _expandedFileNodeKeys: [],
    _openedFileNodeKeys: new Set(),
    _openedFiles: new Set(),
  }),

  getters: {
    commonStore: () => useCommonStore(),
    userStore: () => useUserStore(),
    workData: state => state._workData,
    openedFileNodeKeys: state => state._openedFileNodeKeys,
    openedFiles: state => state._openedFiles,
    selectedFileNodeKeys: state => state._selectedFileNodeKeys,
    expandedFileNodeKeys: state => state._expandedFileNodeKeys,
  },

  actions: {
    async getData(): Promise<FolderNode[]> {
      const localData = getLocalItem<GetWorkDataRep>(storageKeys.WORK_DATA);

      let value: FolderNode[] = localData.data;
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

      workSpaceNodeUtils.sort(value as WorkDataNodeType[]);
      return value;
    },

    async updateWorkData(
      data?: FolderNode[],
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

    queryNodeByKey<T>(rootKey: string, key: string | string[]): T[] {
      const root = workSpaceNodeUtils.getRootNode(this.workData, rootKey);
      return workSpaceNodeUtils.queryAllByKeys(
        [root],
        Array.isArray(key) ? key : [key]
      ) as T[];
    },

    queryKeysByName(name: string): string[] {
      const result: string[] = [];
      const stack = [...this.workData];

      while (stack.length) {
        const item = stack.pop()! as WorkDataNodeType;
        if (!item.isFolder && !item.isFile) {
          continue;
        }
        if (item.name.includes(name)) {
          result.push(item.key); // 匹配成功则添加 key
        }
        if (item.children) {
          // @ts-ignore
          stack.push(...item.children); // 将子节点压入栈中
        }
      }

      return result;
    },

    insertNode<T extends WorkDataNodeType>(node: T, target?: T) {
      if (!target) {
        this._workData.push(node as FolderNode);
        workSpaceNodeUtils.sort(this.workData as WorkDataNodeType[]);
      } else {
        target.children.push(node);
        workSpaceNodeUtils.sort(target.children, target.isFolder);
      }
    },

    updateNode(target: string | WorkDataNodeType, value: object, rootKey = '') {
      if (typeof target !== 'string') rootKey = target.rootKey;
      const root = workSpaceNodeUtils.getRootNode(this.workData, rootKey);
      workSpaceNodeUtils.updateOne([root], target, value);
    },

    removeNode(rootKey: string, key: string) {
      const root = workSpaceNodeUtils.getRootNode(this.workData, rootKey);
      if (root.key === key) {
        workSpaceNodeUtils.removeRoot(this.workData, root);
      } else {
        workSpaceNodeUtils.removeOne([root], key);
      }
    },

    /**用于画布区域的节点粘贴 */
    async pasteComponentNode(options: {
      mouseEv: MouseEvent;
      targetKey: string;
      nodeKeys: string[];
      isCut?: boolean;
    }) {
      const { mouseEv, targetKey, nodeKeys, isCut } = options;

      const wrapperRect = document
        .querySelector(`.${VISUAL_CLASS_NAME}`)!
        .getBoundingClientRect();

      const x = mouseEv.clientX - wrapperRect.left;
      const y = mouseEv.clientY - wrapperRect.top;

      const [targetNode] = workSpaceNodeUtils.queryAllByKeys(this.workData, [
        targetKey,
      ]) as unknown as FileNode[];

      let nodesToPaste = workSpaceNodeUtils.queryAllByKeys(
        this.workData,
        nodeKeys
      ) as unknown as FileConentNode[];

      if (!isCut) {
        nodesToPaste = workSpaceNodeUtils.clone(nodesToPaste);
        // @ts-ignore
        await workSpaceNodeUtils.refreshKeys(nodesToPaste);
      }

      nodesToPaste.forEach(node => {
        node.x = x;
        node.y = y;
        node.attributes.id = node.key;
        node.attributes.style.transform = `translate(${x}px, ${y}px)`;
      });

      targetNode.content.push(...nodesToPaste);
    },

    /**
     * 用于侧边栏文件节点的粘贴
     * 目标节点可以直接从Tree组件右键获取
     */
    async pasteFileNode<T extends WorkDataNodeType>(
      target: T,
      nodeKeys: string[],
      isCut = false
    ) {
      let nodesToPaste = this.queryNodeByKey<WorkDataNodeType>(
        target.rootKey,
        nodeKeys
      );

      if (!isCut) {
        nodesToPaste = workSpaceNodeUtils.clone(nodesToPaste);
        await workSpaceNodeUtils.refreshKeys(nodesToPaste);
      }

      workSpaceNodeUtils.renameDuplicate(target.children, nodesToPaste);
      target.children.push(...nodesToPaste);
      workSpaceNodeUtils.sort(target.children);
    },

    /**用于侧边栏文件节点的拖拽 */
    onDragFileNode(info: AntTreeNodeDropEvent) {
      workSpaceNodeUtils.onDrag2(this.workData, info);
    },

    /**用于画布节点的拖拽*/
    onDragComponentNode(list: FileConentNode[], callback: Drag1Callback) {
      workSpaceNodeUtils.onDrag1(list, callback);
    },

    setSelectedFileNodeKeys(value?: string[]) {
      const keys =
        value ||
        getLocalItem<string[]>(storageKeys.SELECTED_KEYS) ||
        [...this.openedFileNodeKeys][0] ||
        [];
      this._selectedFileNodeKeys = keys;
      setLocalItem(storageKeys.SELECTED_KEYS, keys);
    },

    setExpandedFileNodeKeys(value?: string[]) {
      const _value = value || getLocalItem(storageKeys.EXPANED_KEYS) || [];
      this._expandedFileNodeKeys = _value;
      setLocalItem(storageKeys.EXPANED_KEYS, _value);
    },

    initOpenedFileNodeKeys() {
      this._openedFileNodeKeys = new Set(getLocalItem(storageKeys.OPENED_KEYS));
      this.setOpenedFileNodeKeys();
    },

    setOpenedFileNodeKeys() {
      setLocalItem(storageKeys.OPENED_KEYS, [...this.openedFileNodeKeys]);
    },

    getOpenedFileNodes(): Set<FileNode> {
      const list = new Set<FileNode>();

      const nodes = workSpaceNodeUtils.queryAllByKeys(this.workData, [
        ...this.openedFileNodeKeys,
      ]) as unknown as FileNode[];

      nodes.forEach(item => list.add(item));

      return list;
    },

    updateOpenedFileNodeByKeys(
      method: 'add' | 'delete',
      key: string | string[]
    ) {
      if (!key || !key.length) return;
      if (Array.isArray(key)) {
        key.forEach(k => {
          this._openedFileNodeKeys[method](k);
        });
      } else {
        this._openedFileNodeKeys[method](key);
      }
      this._openedFiles = this.getOpenedFileNodes();
      this.setOpenedFileNodeKeys();
    },

    async import(file: File, node: WorkDataNodeType) {
      const data = await readJsonFile(file);

      if (Array.isArray(data)) {
        workSpaceNodeUtils.renameDuplicate(node.children, data);
        node.children.push(...data);
      } else {
        node.children.push(data);
      }

      workSpaceNodeUtils.sort(node.children, true);
    },

    /**
     * @param fileType 导出文件类型
     * @param node 根节点key或者节点对象
     */
    async export(fileType: DataExportType, node: string | WorkDataNodeType) {
      const data =
        typeof node === 'string'
          ? workSpaceNodeUtils.getRootNode(this.workData, node)
          : node;

      downloadFile(
        import.meta.env.PUBLIC_PROXY +
          (await getExportFileUrl({
            fileType,
            data: data as FolderOrFileNodeType,
          }))
      );
    },
  },
});
