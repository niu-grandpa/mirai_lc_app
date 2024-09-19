export enum ANODE_ACTION_KEY {
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

export const ANodeActionTitles = {
  [ANODE_ACTION_KEY.CREATE_FILE]: '新建页面...',
  [ANODE_ACTION_KEY.CREATE_FOLDER]: '新建文件夹...',
  [ANODE_ACTION_KEY.CUT]: '剪切',
  [ANODE_ACTION_KEY.COPY]: '复制',
  [ANODE_ACTION_KEY.PASTE]: '粘贴',
  [ANODE_ACTION_KEY.IMPORT]: '导入',
  [ANODE_ACTION_KEY.DOWNLOAD]: '下载',
  [ANODE_ACTION_KEY.RENAME]: '重命名...',
  [ANODE_ACTION_KEY.DELETE]: '删除',
};

export enum DOWNLOAD_FILE_TYPE {
  VUE = 'VUE',
  HTML = 'HTML',
  JSON = 'JSON',
}

export const VISUAL_CLASS_NAME = 'workspace-visual';
