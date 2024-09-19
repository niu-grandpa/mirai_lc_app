import {
  CloudDownloadOutlined,
  FolderOpenOutlined,
  HighlightOutlined,
  LayoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';

export enum SIDEBAR_OPTIONS {
  RESOURCE = 'RESOURCE',
  COMPONENT = 'COMPONENT',
  STYLE = 'STYLE',
  EXPORT = 'EXPORT',
  USER = 'USER',
  SETTING = 'SETTING',
}

export default {
  options: [
    {
      active: true,
      title: '资源管理器',
      icon: FolderOpenOutlined,
      key: SIDEBAR_OPTIONS.RESOURCE,
    },
    {
      active: false,
      title: '导出',
      icon: CloudDownloadOutlined,
      key: SIDEBAR_OPTIONS.EXPORT,
    },
    {
      active: false,
      title: '组件面板',
      icon: LayoutOutlined,
      key: SIDEBAR_OPTIONS.COMPONENT,
    },
    {
      active: false,
      title: '样式调节',
      icon: HighlightOutlined,
      key: SIDEBAR_OPTIONS.STYLE,
    },
    {
      active: false,
      title: '帐户',
      icon: UserOutlined,
      key: SIDEBAR_OPTIONS.USER,
    },
    {
      active: false,
      title: '设置',
      icon: SettingOutlined,
      key: SIDEBAR_OPTIONS.SETTING,
    },
  ],
};
