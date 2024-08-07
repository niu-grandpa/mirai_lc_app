export enum ANODE_ACTION_KEY {
  CREATE_FOLDER = 'folder',
  CREATE_FILE = 'file',
  CUT = 'cut',
  COPY = 'copy',
  PASTE = 'paste',
  REFRESH = 'refresh',
  RENAME = 'rename',
  DELETE = 'delete',
  VIEW_CODE = 'viewCode',
}

export const ANodeActionTitles = {
  [ANODE_ACTION_KEY.CREATE_FILE]: '新建文件...',
  [ANODE_ACTION_KEY.CREATE_FOLDER]: '新建文件夹...',
  [ANODE_ACTION_KEY.CUT]: '剪切',
  [ANODE_ACTION_KEY.COPY]: '复制',
  [ANODE_ACTION_KEY.PASTE]: '粘贴',
  [ANODE_ACTION_KEY.REFRESH]: '刷新',
  [ANODE_ACTION_KEY.RENAME]: '重命名...',
  [ANODE_ACTION_KEY.DELETE]: '删除',
};
