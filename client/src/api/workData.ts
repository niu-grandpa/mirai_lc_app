import { request } from '.';

export interface GetWorkDataRep {
  userId: number;
  saveTime: number;
  data: FolderNode[];
  created_at: string;
}

export type SyncWorkDataReq = {
  account: number;
  saveTime: number;
  data: FolderNode[];
};

export const createNodeId = async (): Promise<string> => {
  const { data } = await request<string>({
    method: 'GET',
    url: '/work-data/node-id',
  });
  return data;
};

export const getWorkData = async (account: number): Promise<GetWorkDataRep> => {
  const { data } = await request<GetWorkDataRep>({
    method: 'GET',
    url: '/work-data/all',
    data: {
      params: { account },
    },
  });
  return data;
};

export const syncWorkData = async (data: SyncWorkDataReq) => {
  await request({
    method: 'PUT',
    url: '/work-data/sync',
    data,
  });
};

export type CreateFolderNodeReq = {
  name: string;
  rootKey: string;
  isRoot: boolean;
};

export interface FolderNode {
  key: string;
  name: string;
  isRoot: boolean;
  rootKey: string;
  children: FileNode[];
  isLeaf: boolean;
  isFolder: boolean;
  createAt?: string;
}

export const createFolderNode = async (
  data: CreateFolderNodeReq
): Promise<FolderNode> => {
  const { data: res } = await request<FolderNode>({
    method: 'POST',
    url: '/work-data/create-folder',
    data,
  });
  return res;
};

export interface FileNode {
  key: string;
  name: string;
  rootKey: string;
  isFile: boolean;
  isLeaf: boolean;
  content: FileConentNode[];
  props: { [x: string]: any };
  emits: { event: string; payload: any }[];
}

export const createFileNode = async (
  rootKey: string,
  name: string
): Promise<FileNode> => {
  const { data: res } = await request<FileNode>({
    method: 'POST',
    url: '/work-data/create-file',
    data: { name, rootKey },
  });
  return res;
};

export type CreateComponentNodeReq = {
  x: number;
  y: number;
  rootKey: string;
  tagName: string;
  textContent: string;
};

export interface FileConentNode {
  x: number;
  y: number;
  key: string;
  path: string;
  rootKey: string;
  tagName: string;
  textContent: string;
  attributes: { [x: string]: any | { [x: string]: any } };
  eventBinding: {
    [x: string]: { [x: string]: string };
  };
  children: FileConentNode[];
}

export const createComponentNode = async (
  data: CreateComponentNodeReq
): Promise<FileConentNode> => {
  const { data: res } = await request<FileConentNode>({
    method: 'POST',
    url: '/work-data/create-component',
    data,
  });
  return res;
};

export type FolderOrFileNodeType =
  | FolderNode
  | (FileNode & { children?: FolderOrFileNodeType[] });

export type WorkDataNodeType = (FolderNode | FileNode | FileConentNode) & {
  name: string;
  rootKey: string;
  isFile: boolean;
  isLeaf: boolean;
  isFolder: boolean;
  children: WorkDataNodeType[];
};
