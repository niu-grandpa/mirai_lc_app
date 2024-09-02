import {
  CloudDownloadOutlined,
  HighlightOutlined,
  LaptopOutlined,
  LayoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { type LaptopOutlinedIconType } from '@ant-design/icons-vue/lib/icons/LaptopOutlined';
import CompPanel from './CompPanel/Index.vue';
import DirectoryTree from './DirectoryTree.vue';
import Export from './Export.vue';
import StyleAdjust from './StyleAdjust/Index.vue';

export enum RIGHT_OPTIONS {
  RESOURCE = 'RESOURCE',
  COMPONENT = 'COMPONENT',
  STYLE = 'STYLE',
  EXPORT = 'EXPORT',
  USER = 'USER',
  SETTING = 'SETTING',
}

export const COMPONENT_MAP = {
  [RIGHT_OPTIONS.RESOURCE]: DirectoryTree,
  [RIGHT_OPTIONS.COMPONENT]: CompPanel,
  [RIGHT_OPTIONS.STYLE]: StyleAdjust,
  [RIGHT_OPTIONS.EXPORT]: Export,
};

interface PanelOptions {
  title: string;
  icon: LaptopOutlinedIconType;
  key: RIGHT_OPTIONS;
  active: boolean;
}

export const PANEL_OPTIONS: PanelOptions[] = [
  {
    title: '资源管理器',
    icon: LaptopOutlined,
    key: RIGHT_OPTIONS.RESOURCE,
    active: true,
  },
  {
    title: '组件面板',
    icon: LayoutOutlined,
    key: RIGHT_OPTIONS.COMPONENT,
    active: false,
  },
  {
    title: '样式调节',
    icon: HighlightOutlined,
    key: RIGHT_OPTIONS.STYLE,
    active: false,
  },
  {
    title: '导出',
    icon: CloudDownloadOutlined,
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
