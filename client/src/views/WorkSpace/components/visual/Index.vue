<template>
  <section v-if="!store.openedFileNodeKeys.size" class="logo-overview">
    <figure class="img">
      <img width="100%" height="100%" :src="BlackLogo" />
    </figure>
  </section>

  <a-tabs
    v-else
    hide-add
    size="small"
    @edit="onDeleteTab"
    :tab-bar-gutter="3"
    type="editable-card"
    v-model:active-key="activeKey"
    v-show="store.openedFileNodeKeys.size"
    :tab-bar-style="{ marginBottom: '6px', padding: '0 12px' }">
    <a-tab-pane
      v-for="(pane, i) in store.openedFiles"
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
import { NODE_ACTION_KEY, VISUAL_CLASS_NAME } from '@/share/enums';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { MenuProps } from 'ant-design-vue';
import BlackLogo from 'public/logo-black.svg';
import { computed, ref, watch } from 'vue';
import Visualizer from './Visualizer.vue';

const store = useWorkspaceStore();

const isShowOption = ref(true);
const copyNodeKey = ref('');
const curNodeKey = ref('');
const rootKey = ref('');
const isShowHightlight = ref(true);
const activeKey = ref(
  store.selectedFileNodeKeys[store.selectedFileNodeKeys.length - 1]
);

let rightClickMouseEv: MouseEvent | null = null;

const menuItems = computed(() => [
  {
    title: '复制',
    show: isShowOption.value,
    key: NODE_ACTION_KEY.COPY,
  },
  {
    title: '源码预览',
    show: !isShowOption.value,
    key: NODE_ACTION_KEY.VIEW_CODE,
  },
  {
    title: '粘贴',
    show: true,
    disabled: !copyNodeKey.value.length,
    key: NODE_ACTION_KEY.PASTE,
  },
  {
    title: '删除',
    show: isShowOption.value,
    key: NODE_ACTION_KEY.DELETE,
  },
]);

watch(
  () => activeKey.value,
  newVal => {
    store.setSelectedFileNodeKeys([newVal]);
  }
);

watch(
  () => store.selectedFileNodeKeys,
  newVal => {
    const lastKey = newVal[newVal.length - 1];
    if (!lastKey?.endsWith(';fld')) {
      activeKey.value = lastKey;
      store.setSelectedFileNodeKeys(newVal);
      store.updateOpenedFileNodeByKeys('add', lastKey);
    }
  }
);

const onDeleteTab = (targetKey: string) => {
  const arr = [...store.openedFileNodeKeys];

  store.updateOpenedFileNodeByKeys('delete', targetKey);

  const curSelectedKey =
    store.selectedFileNodeKeys[store.selectedFileNodeKeys.length - 1];

  if (targetKey === curSelectedKey) {
    const curIdx = arr.indexOf(targetKey);
    const newSelectedKey = [arr[curIdx - 1] ?? arr[curIdx + 1]];
    store.setSelectedFileNodeKeys(newSelectedKey);
  } else {
    store.setSelectedFileNodeKeys(
      store.selectedFileNodeKeys.filter(k => k !== targetKey)
    );
  }
};

const onRightClick = (ev: MouseEvent) => {
  rightClickMouseEv = ev;

  const target = ev.target as HTMLElement;

  if (!target.classList.contains(VISUAL_CLASS_NAME) && target.id?.length >= 9) {
    curNodeKey.value = target.id;
    rootKey.value = target.dataset.rootKey!;
    isShowOption.value = true;
  } else {
    isShowOption.value = false;
  }
};

const onMenuClick: MenuProps['onClick'] = async ({ key, domEvent }) => {
  if (key === NODE_ACTION_KEY.COPY) {
    copyNodeKey.value = curNodeKey.value;
    curNodeKey.value = '';
  } else if (key === NODE_ACTION_KEY.PASTE) {
    store.pasteComponentNode({
      mouseEv: rightClickMouseEv!,
      targetKey: curNodeKey.value,
      nodeKeys: [copyNodeKey.value],
    });
    rightClickMouseEv = null;
  } else if (key === NODE_ACTION_KEY.DELETE) {
    store.removeNode(rootKey.value, curNodeKey.value);
    isShowHightlight.value = false;
    curNodeKey.value = '';
  } else if (key === NODE_ACTION_KEY.VIEW_CODE) {
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
    width: 270px;
    height: 270px;
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
