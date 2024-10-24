export interface FolderNode {
  key: string;
  name: string;
  isRoot: boolean;
  rootKey: string;
  children: FolderChildren[];
  isLeaf: boolean;
  isFolder: boolean;
  createAt?: string;
}

export type FolderChildren = FolderNode | FileNode;

export interface FileNode {
  key: string;
  name: string;
  isFile: boolean;
  isLeaf: boolean;
  rootKey: string;
  content: FileContentNode[];
  props: { [x: string]: any };
  emits: { event: string; payload: any }[];
}

export interface FileContentNode {
  x: number;
  y: number;
  key: string;
  path: string; // 文件路径，如果是组件则通过这个属性去import
  rootKey: string;
  tagName: string;
  textContent: string;
  attributes: { [x: string]: any | { [x: string]: any } };
  eventBinding: {
    [x: string]: { [x: string]: string };
  };
  children: FileContentNode[];
}
