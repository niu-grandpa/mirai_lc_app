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
}

export interface FileContentNode {
  x: number;
  y: number;
  key: string;
  rootKey: string;
  tagName: string;
  textContent: string;
  attributes: { [x: string]: any | { [x: string]: any } };
  eventBinding: {
    [x: string]: { [x: string]: string };
  };
  children: FileContentNode[];
}
