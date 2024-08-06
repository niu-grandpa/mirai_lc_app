import {
  BellOutlined,
  ExportOutlined,
  LaptopOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import DirectoryTree from './DirectoryTree.vue';
import Export from './Export.vue';
import NotificationList from './NotificationList/Index.vue';

export enum RIGHT_OPTIONS {
  RESOURCE = 'resource',
  NOTICE = 'notice',
  EXPORT = 'export',
  USER = 'user',
  SETTING = 'setting',
}

export const COMPONENT_MAP = {
  [RIGHT_OPTIONS.RESOURCE]: DirectoryTree,
  [RIGHT_OPTIONS.NOTICE]: NotificationList,
  [RIGHT_OPTIONS.EXPORT]: Export,
};

export const PANEL_OPTIONS = [
  {
    title: '资源管理器',
    icon: LaptopOutlined,
    key: RIGHT_OPTIONS.RESOURCE,
    active: true,
  },
  {
    title: '消息通知',
    icon: BellOutlined,
    key: RIGHT_OPTIONS.NOTICE,
    active: false,
  },
  {
    title: '导出',
    icon: ExportOutlined,
    key: RIGHT_OPTIONS.EXPORT,
    active: false,
  },
  { title: '帐户', icon: UserOutlined, key: RIGHT_OPTIONS.USER, active: false },
  {
    title: '设置',
    icon: SettingOutlined,
    key: RIGHT_OPTIONS.SETTING,
    active: false,
  },
];
