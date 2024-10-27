export enum NODE_ACTION_KEY {
  CREATE_PROJECT = 'project',
  CREATE_FOLDER = 'folder',
  CREATE_FILE = 'file',
  CUT = 'cut',
  COPY = 'copy',
  PASTE = 'paste',
  IMPORT = 'import',
  EXPORT = 'export',
  RENAME = 'rename',
  DELETE = 'delete',
  VIEW_CODE = 'viewCode',
}

export enum EXPORT_OPTIONS {
  VUE = 'vue',
  REACT = 'react',
  JSON = 'json',
  HTML = 'html',
}

export const ExportOptions = {
  [EXPORT_OPTIONS.VUE]: 'vue',
  // [EXPORT_OPTIONS.REACT]: 'react',
  [EXPORT_OPTIONS.JSON]: 'json',
  [EXPORT_OPTIONS.HTML]: 'html',
};

export const NodeActionTitles = {
  [NODE_ACTION_KEY.CREATE_FILE]: '新建页面...',
  [NODE_ACTION_KEY.CREATE_FOLDER]: '新建文件夹...',
  [NODE_ACTION_KEY.CUT]: '剪切',
  [NODE_ACTION_KEY.COPY]: '复制',
  [NODE_ACTION_KEY.PASTE]: '粘贴',
  [NODE_ACTION_KEY.IMPORT]: '导入 json',
  [NODE_ACTION_KEY.EXPORT]: '导出',
  [NODE_ACTION_KEY.RENAME]: '重命名...',
  [NODE_ACTION_KEY.DELETE]: '删除',
};

export const VISUAL_CLASS_NAME = 'workspace-visual';
