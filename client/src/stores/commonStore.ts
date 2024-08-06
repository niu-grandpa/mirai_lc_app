import { type UseDragAction, type UseDragTargetInfo } from '@/hooks/useDrag';
import { defineStore } from 'pinia';

export interface DragState extends UseDragTargetInfo {
  action: UseDragAction;
}

interface CommonState {
  _loading: boolean;
  _dragData: DragState;
}

export const useCommonStore = defineStore('common', {
  state: (): CommonState => ({
    _loading: false,
    _dragData: { x: 0, y: 0, el: null, width: 0, height: 0, action: 'end' },
  }),

  getters: {
    loading: state => state._loading,
    dragData: state => state._dragData,
  },

  actions: {
    setLoading(value: boolean) {
      this._loading = value;
    },

    setDragData(data: DragState) {
      this._dragData = data;
    },
  },
});
