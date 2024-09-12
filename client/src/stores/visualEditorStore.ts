import { useTreeManager } from '@/hooks';
import { type ElementANode } from '@/share/abstractNode';
import { VISUAL_CLASS_NAME } from '@/share/enums';
import { defineStore } from 'pinia';
import { useCommonStore } from './commonStore';
import { useWorkspaceStore } from './workspaceStore';

const treeManager = useTreeManager();

export const useVisualEditorStore = defineStore('visualEditor', {
  getters: {
    commonStore: () => useCommonStore(),
    workspaceStore: () => useWorkspaceStore(),
  },

  actions: {
    async pasteNode(mouseEv: MouseEvent, targetKey: string, key: string) {
      const wrapperRect = document
        .querySelector(`.${VISUAL_CLASS_NAME}`)!
        .getBoundingClientRect();

      const x = mouseEv.clientX - wrapperRect.left;
      const y = mouseEv.clientY - wrapperRect.top;

      const data = (
        await treeManager
          .setData(this.workspaceStore.workData)
          .pasteNode(targetKey, [key], ([item]: ElementANode[]) => {
            item.x = x;
            item.y = y;
            item.attrs['id'] = item.key;
            item.attrs.style['transform'] = `translate(${x}px, ${y}px)`;
          })
      ).getData();

      treeManager.freed();
      this.workspaceStore.updateWorkData(data);
    },
  },
});
