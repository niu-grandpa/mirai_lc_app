import commonConfig from '@/config/common';
import { type UseDragAction, type UseDragTargetInfo } from '@/hooks/useDrag';
import { defineStore } from 'pinia';

export interface DragState extends UseDragTargetInfo {
  action: UseDragAction;
}

type Theme = 'dark' | 'light';

export const useCommonStore = defineStore('common', {
  state: () => ({
    _theme: commonConfig.theme as Theme,
    _loading: commonConfig.loading,
    _dragData: {
      x: 0,
      y: 0,
      el: null,
      width: 0,
      height: 0,
      action: 'end',
    } as DragState,
  }),

  getters: {
    theme: state => state._theme,
    loading: state => state._loading,
    dragData: state => state._dragData,
  },

  actions: {
    setTheme(value: Theme) {
      this._theme = value;
    },

    setLoading(value: boolean) {
      this._loading = value;
    },

    setDragData(data: DragState) {
      this._dragData = data as any;
    },
  },
});
