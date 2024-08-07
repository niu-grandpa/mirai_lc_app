<template>
  <section v-if="!store.openedNodes.size" class="logo-overview">
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
    v-show="store.openedNodes.size"
    :tab-bar-style="{ padding: '0 12px' }">
    <a-tab-pane
      v-for="pane in store.openedNodes"
      :key="pane.key"
      :tab="pane.name"
      style="padding: 0 12px">
      <a-dropdown :trigger="['contextmenu']" @contextmenu="onRightClick">
        <Visualizer :id="pane.key" :data="pane.anodes" />
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
import { ANODE_ACTION_KEY } from '@/enums';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { MenuProps } from 'ant-design-vue';
import BlackLogo from 'public/logo-black.svg';
import { computed, ref, watch } from 'vue';
import Visualizer from './Visualizer.vue';

const store = useWorkspaceStore();

const activeKey = ref(store.selectedKey[store.selectedKey.length - 1]);
const isShowOption = ref(true);
const tempCopyKey = ref('');
const copyKey = ref('');

const menuItems = computed(() => [
  {
    title: '剪切',
    show: isShowOption.value,
    key: ANODE_ACTION_KEY.CUT,
  },
  {
    title: '复制',
    show: isShowOption.value,
    key: ANODE_ACTION_KEY.COPY,
  },
  {
    title: '预览代码',
    show: !isShowOption.value,
    key: ANODE_ACTION_KEY.VIEW_CODE,
  },
  {
    title: '粘贴',
    show: !isShowOption.value,
    disabled: !copyKey.value.length,
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
    store.updateSelectedKey([newVal]);
  }
);

watch(
  () => store.selectedKey,
  newVal => {
    const lastKey = newVal[newVal.length - 1];
    if (!lastKey.endsWith(FolderKeySuffix)) {
      activeKey.value = lastKey;
      store.updateSelectedKey(newVal);
      store.updateOpenedFileANodes('add', lastKey);
    }
  }
);

const onDeleteTab = (targetKey: string) => {
  const arr = [...store.openedKeys];
  store.updateOpenedFileANodes('delete', targetKey);
  const curSelectedKey = store.selectedKey[store.selectedKey.length - 1];
  if (targetKey === curSelectedKey) {
    const curIdx = arr.indexOf(targetKey);
    const newSelectedKey = [arr[curIdx - 1] ?? arr[curIdx + 1]];
    store.updateSelectedKey(newSelectedKey);
  } else {
    store.updateSelectedKey(store.selectedKey.filter(k => k !== targetKey));
  }
};

const onRightClick = ({ target }: MouseEvent) => {
  const _target = target as HTMLElement;
  isShowOption.value = !_target.classList.contains('workspace-visual');
  if (_target.id && _target.id.length == 9) tempCopyKey.value = _target.id;
};

const onMenuClick: MenuProps['onClick'] = ({ key }) => {
  if (key === ANODE_ACTION_KEY.COPY || key === ANODE_ACTION_KEY.CUT) {
    copyKey.value = tempCopyKey.value;
  } else if (key === ANODE_ACTION_KEY.PASTE) {
    console.log(copyKey.value);
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
