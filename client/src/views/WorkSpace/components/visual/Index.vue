<template>
  <section v-if="!workspaceStore.openedFiles.size" class="logo-overview">
    <figure class="img">
      <img width="100%" height="100%" :src="BlackLogo" />
      <h3 class="title">从右侧选择文件以开始您的创作</h3>
    </figure>
  </section>

  <a-tabs
    hide-add
    size="small"
    @edit="onDeleteTab"
    :tab-bar-gutter="3"
    type="editable-card"
    v-model:active-key="activeKey"
    v-show="workspaceStore.openedFiles.size"
    :tab-bar-style="{ padding: '0 12px' }">
    <a-tab-pane
      v-for="(pane, i) in workspaceStore.openedFiles"
      :key="pane.key"
      :tab="pane.name">
      <a-dropdown :trigger="['contextmenu']" @contextmenu="onRightClick">
        <Visualizer
          :id="pane.key"
          :index="i"
          :show-hightlight="isShowHightlight" />
        <template #overlay>
          <a-menu @click="onMenuClick" style="width: 120px">
            <template v-for="item in menuItems" :key="item.key">
              <a-menu-item
                v-if="item.show"
                :key="item.key"
                :disabled="item.disabled">
                {{ item.title }}
              </a-menu-item>
            </template>
          </a-menu>
        </template>
      </a-dropdown>
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import { FolderKeySuffix } from '@/core/tree-manager/share';
import { ANODE_ACTION_KEY, VISUAL_CLASS_NAME } from '@/share/enums';
import { useNodeManagerStore } from '@/stores/nodeManagerStore';
import { useVisualEditorStore } from '@/stores/visualEditorStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { MenuProps } from 'ant-design-vue';
import BlackLogo from 'public/logo-black.svg';
import { computed, ref, watch } from 'vue';
import Visualizer from './Visualizer.vue';

const workspaceStore = useWorkspaceStore();
const nodeManagerStore = useNodeManagerStore();
const visualEditorStore = useVisualEditorStore();

const activeKey = ref(
  nodeManagerStore.selectedKeys[nodeManagerStore.selectedKeys.length - 1]
);
const isShowOption = ref(true);
const copyNodeKey = ref('');
const curNodeKey = ref('');
const isShowHightlight = ref(true);

let rightClickMouseEv: MouseEvent | null = null;

const menuItems = computed(() => [
  {
    title: '复制',
    show: isShowOption.value,
    key: ANODE_ACTION_KEY.COPY,
  },
  {
    title: '源码预览',
    show: !isShowOption.value,
    key: ANODE_ACTION_KEY.VIEW_CODE,
  },
  {
    title: '粘贴',
    show: true,
    disabled: !copyNodeKey.value.length,
    key: ANODE_ACTION_KEY.PASTE,
  },
  {
    title: '删除',
    show: isShowOption.value,
    key: ANODE_ACTION_KEY.DELETE,
  },
]);

watch(
  () => activeKey.value,
  newVal => {
    nodeManagerStore.updateSelectedKeys([newVal]);
  }
);

watch(
  () => nodeManagerStore.selectedKeys,
  newVal => {
    const lastKey = newVal[newVal.length - 1];
    if (!lastKey?.endsWith(FolderKeySuffix)) {
      activeKey.value = lastKey;
      nodeManagerStore.updateSelectedKeys(newVal);
      workspaceStore.updateOpenedFilesByKeys('add', lastKey);
    }
  }
);

const onDeleteTab = (targetKey: string) => {
  const arr = [...workspaceStore.openedFileKeys];
  workspaceStore.updateOpenedFilesByKeys('delete', targetKey);
  const curSelectedKey =
    nodeManagerStore.selectedKeys[nodeManagerStore.selectedKeys.length - 1];
  if (targetKey === curSelectedKey) {
    const curIdx = arr.indexOf(targetKey);
    const newSelectedKey = [arr[curIdx - 1] ?? arr[curIdx + 1]];
    nodeManagerStore.updateSelectedKeys(newSelectedKey);
  } else {
    nodeManagerStore.updateSelectedKeys(
      nodeManagerStore.selectedKeys.filter(k => k !== targetKey)
    );
  }
};

const onRightClick = (ev: MouseEvent) => {
  rightClickMouseEv = ev;
  const target = ev.target as HTMLElement;
  if (!target.classList.contains(VISUAL_CLASS_NAME) && target.id?.length >= 9) {
    curNodeKey.value = target.id;
    isShowOption.value = true;
  } else {
    isShowOption.value = false;
  }
};

const onMenuClick: MenuProps['onClick'] = async ({ key, domEvent }) => {
  if (key === ANODE_ACTION_KEY.COPY) {
    copyNodeKey.value = curNodeKey.value;
    curNodeKey.value = '';
  } else if (key === ANODE_ACTION_KEY.PASTE) {
    visualEditorStore.pasteNode(
      rightClickMouseEv!,
      curNodeKey.value,
      copyNodeKey.value
    );
    rightClickMouseEv = null;
  } else if (key === ANODE_ACTION_KEY.DELETE) {
    workspaceStore.removeNode(curNodeKey.value);
    isShowHightlight.value = false;
    curNodeKey.value = '';
  } else if (key === ANODE_ACTION_KEY.VIEW_CODE) {
    //
  }
};
</script>

<style scoped>
.logo-overview {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .img {
    width: 250px;
    height: 250px;
    font-weight: bold;
    text-align: center;
    color: #ccccccd2;
    .title {
      font-weight: 600;
      font-size: 20px;
      line-height: 1.4;
    }
  }
}
</style>
