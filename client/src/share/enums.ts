export enum NODE_ACTION_KEY {
  CREATE_PROJECT = 'project',
  CREATE_FOLDER = 'folder',
  CREATE_FILE = 'file',
  CUT = 'cut',
  COPY = 'copy',
  PASTE = 'paste',
  IMPORT = 'import',
  DOWNLOAD = 'download',
  RENAME = 'rename',
  DELETE = 'delete',
  VIEW_CODE = 'viewCode',
}

export const NodeActionTitles = {
  [NODE_ACTION_KEY.CREATE_FILE]: '新建页面...',
  [NODE_ACTION_KEY.CREATE_FOLDER]: '新建文件夹...',
  [NODE_ACTION_KEY.CUT]: '剪切',
  [NODE_ACTION_KEY.COPY]: '复制',
  [NODE_ACTION_KEY.PASTE]: '粘贴',
  [NODE_ACTION_KEY.IMPORT]: '导入',
  [NODE_ACTION_KEY.DOWNLOAD]: '下载',
  [NODE_ACTION_KEY.RENAME]: '重命名...',
  [NODE_ACTION_KEY.DELETE]: '删除',
};

export const VISUAL_CLASS_NAME = 'workspace-visual';
