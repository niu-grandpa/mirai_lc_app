import { IReq, IReqQuery, IRes } from '@/types/types';
import { handleReqError, sendResponse } from '@util/misc';
import HttpStatusCodes from 'constants/http_status_codes';
import { nanoid } from 'nanoid';
import { FileContentNode, FileNode, FolderChildren, FolderNode } from './types';

export default class TreeDataOptionsController {
  private genId(suffix = ''): string {
    return `n${nanoid()}${suffix ?? ''}`;
  }

  private __createFileNode(_rootKey: string, name: string): FileNode {
    const key = this.genId();
    // 只有创建单个文件作为根才会出现的情况
    const rootKey = !_rootKey ? key : _rootKey;
    return {
      key,
      name,
      rootKey,
      props: {},
      emits: [],
      isFile: true,
      isLeaf: true,
      content: [],
    };
  }

  createNodeId = async (req: IReqQuery<{}>, res: IRes): Promise<IRes> => {
    try {
      return sendResponse(res, HttpStatusCodes.OK, {
        data: this.genId(),
      });
    } catch (e) {
      throw handleReqError(e);
    }
  };

  createFolderNode = async (
    req: IReq<{ name: string; isRoot: boolean; rootKey: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const { name, isRoot: topIsRoot, rootKey: rk } = req.body;
      const rootKey = topIsRoot ? this.genId(';fld') : rk;

      const creator = (name: string, isRoot = false): FolderChildren => {
        const key = isRoot ? rootKey : this.genId(';fld');
        const children = isRoot ? [creator('src')] : [];

        if (topIsRoot && !isRoot && name === 'src') {
          children.push(this.__createFileNode(rootKey, 'index'));
        }

        const data: FolderNode = {
          key,
          name,
          isRoot,
          rootKey,
          children,
          isLeaf: false,
          isFolder: true,
        };

        isRoot && (data.createAt = new Date().toLocaleString());
        return data;
      };

      return sendResponse(res, HttpStatusCodes.OK, creator(name, topIsRoot));
    } catch (e) {
      throw handleReqError(e);
    }
  };

  createFileNode = async (
    req: IReq<{ name: string; rootKey: string }>,
    res: IRes
  ): Promise<IRes> => {
    try {
      return sendResponse(
        res,
        HttpStatusCodes.OK,
        this.__createFileNode(req.body.rootKey, req.body.name)
      );
    } catch (e) {
      throw handleReqError(e);
    }
  };

  createComponent = async (
    req: IReq<FileContentNode>,
    res: IRes
  ): Promise<IRes> => {
    try {
      const { x, y, rootKey, tagName, textContent, attributes, eventBinding } =
        req.body;
      const obj: FileContentNode = {
        x,
        y,
        path: '',
        tagName,
        rootKey,
        eventBinding,
        children: [],
        textContent,
        key: this.genId(),
        attributes: {
          style: {
            position: 'absolute',
            transform: `translate(${x}px, ${y}px)`,
          },
          ...attributes,
        },
      };
      return sendResponse(res, HttpStatusCodes.OK, obj);
    } catch (e) {
      throw handleReqError(e);
    }
  };
}
