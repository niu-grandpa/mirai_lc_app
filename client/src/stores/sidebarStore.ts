import { getLocalItem, setLocalItem } from '@/share';
import { defineStore } from 'pinia';

const initWidth = getLocalItem<number>('SIDER_WIDTH') || 350;

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    _visible: true,
    _width: initWidth,
    _initWidth: initWidth,
  }),

  getters: {
    width: state => state._width,
    visible: state => state._visible,
    initWidth: state => state._initWidth,
  },

  actions: {
    setWidth(w: number) {
      const visible = !(w <= 250);
      this._visible = visible;
      this._width = !visible ? 42 : w;
    },

    updateInitWidth() {
      const w = this.width;
      this._initWidth = w;
      setLocalItem('SIDER_WIDTH', w);
    },
  },
});
