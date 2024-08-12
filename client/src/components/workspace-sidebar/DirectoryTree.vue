<template>
  <a-input-search
    v-model:value="searchValue"
    style="margin-bottom: 8px"
    placeholder="搜索文件" />

  <section class="empty" v-if="!store.treeData.length">
    <a-empty />
    <a-button
      type="primary"
      block
      :icon="h(PlusOutlined)"
      @click="onFirstCreate">
      新建
    </a-button>
  </section>

  <a-dropdown v-else :trigger="['contextmenu']">
    <a-directory-tree
      multiple
      draggable
      block-node
      :height="maxHeight"
      @drop="store.dragNode"
      @rightClick="onRightClick"
      :tree-data="store.treeData"
      :field-names="{ title: 'name' }"
      @expand="autoExpandParent = false"
      v-model:expandedKeys="expandedKeys"
      :auto-expand-parent="autoExpandParent"
      v-model:selectedKeys="store._selectedKey"
      :style="{ height: `${maxHeight}px`, overflow: 'auto' }">
      <template #title="{ name, key: treeKey }">
        <a-dropdown :trigger="['contextmenu']">
          <span v-if="name.includes(searchValue)" :title="name">
            {{ name.substring(0, name.indexOf(searchValue)) }}
            <span style="color: #f50">{{ searchValue }}</span>
            {{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
          </span>
          <span v-else :title="name">{{ name }}</span>

          <template #overlay>
            <a-menu
              style="width: 120px"
              @click="(item:any) => onCtxMenuClick(treeKey, item.key, name)">
              <a-menu-item
                :key="k"
                v-for="(v, k) in ANodeActionTitles"
                :danger="k === ANODE_ACTION_KEY.DELETE"
                :style="{ display: isCtxOptHidden(k) ? 'none' : '' }"
                :disabled="
                  k === ANODE_ACTION_KEY.PASTE && !cloneNodeKeys.keys.length
                ">
                {{ v }}
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-directory-tree>

    <template #overlay>
      <a-menu
        style="width: 120px"
        @click="(item:any) => onCtxMenuClick('', item.key, '')">
        <a-menu-item :key="ANODE_ACTION_KEY.CREATE_FOLDER">
          {{ ANodeActionTitles[ANODE_ACTION_KEY.CREATE_FOLDER] }}
        </a-menu-item>
        <a-menu-item :key="ANODE_ACTION_KEY.CREATE_FILE">
          {{ ANodeActionTitles[ANODE_ACTION_KEY.CREATE_FILE] }}
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>

  <a-modal
    :width="260"
    :mask="false"
    okText="确定"
    cancelText="取消"
    :closable="false"
    :title="
      modalTitle[
        // @ts-ignore
        ctxMenuKey
      ]
    "
    @ok="onRenameOrCreateNode"
    v-model:open="openRenameOrCreateModal">
    <a-input v-model:value="currentNodeName" placeholder="起个名字吧..." />
  </a-modal>
</template>

<script setup lang="ts">
import { FolderKeySuffix } from '@/core/tree-manager/share';
import { getLocalItem, getWinHeight, setLocalItem } from '@/share';
import { ANODE_ACTION_KEY, ANodeActionTitles } from '@/share/enums';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { type FileANode } from '@/types/abstractNode';
import { PlusOutlined } from '@ant-design/icons-vue';
import { Checkbox, message, Modal } from 'ant-design-vue';
import {
  h,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';

const modalTitle = {
  [ANODE_ACTION_KEY.CREATE_FOLDER]: '新建文件夹',
  [ANODE_ACTION_KEY.CREATE_FILE]: '新建文件',
  [ANODE_ACTION_KEY.RENAME]: '重命名',
};

const store = useWorkspaceStore();

const searchValue = ref('');
const currentNodeKey = ref('');
const currentNodeName = ref('');
const showCreate = ref(true);
const showPaste = ref(true);
const showDelPrompt = ref(false);
const autoExpandParent = ref(false);
const expandedKeys = ref<string[]>([]);
const ctxMenuKey = ref<ANODE_ACTION_KEY>();
const openRenameOrCreateModal = ref(false);
const maxHeight = ref(getWinHeight() - 58);
const cloneNodeKeys = reactive<{ keys: string[]; type: 'copy' | 'cut' }>({
  keys: [],
  type: 'copy',
});

const setTreeMaxHeight = () => (maxHeight.value = getWinHeight() - 58);

onMounted(() => {
  window.addEventListener('resize', setTreeMaxHeight);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', setTreeMaxHeight);
});

onBeforeMount(() => {
  showDelPrompt.value = getLocalItem('showDelPrompt');
  expandedKeys.value = store.expandedKeys;
});

watch(
  () => expandedKeys.value,
  newVal => {
    const val = newVal.filter(item => item.endsWith(FolderKeySuffix));
    store.updateExpandedKeys(val);
  }
);

const onSearch = (value: string) => {
  const expanded = store.findKeysByName(value);
  store.updateExpandedKeys(expanded);
  searchValue.value = value;
  autoExpandParent.value = true;
};

watch(() => searchValue.value, onSearch);

const isCtxOptHidden = (k: ANODE_ACTION_KEY) => {
  return (
    (k === ANODE_ACTION_KEY.PASTE && !showPaste.value) ||
    ([ANODE_ACTION_KEY.CREATE_FOLDER, ANODE_ACTION_KEY.CREATE_FILE].includes(
      k
    ) &&
      !showCreate.value)
  );
};

const onFirstCreate = () => {
  ctxMenuKey.value = ANODE_ACTION_KEY.CREATE_FOLDER;
  openCreateModal();
};

const onRightClick = ({ event, node }: { event: any; node: FileANode }) => {
  event.stopPropagation();
  showCreate.value = !node.isLeaf;
  showPaste.value = !node.isLeaf;
};

const onCtxMenuClick = (
  key: string,
  menuKey: ANODE_ACTION_KEY,
  name: string
) => {
  const keys = store.selectedKey.includes(key) ? store.selectedKey : [key];
  const actions = {
    [ANODE_ACTION_KEY.CREATE_FOLDER]: openCreateModal,
    [ANODE_ACTION_KEY.CREATE_FILE]: openCreateModal,
    [ANODE_ACTION_KEY.COPY]: () => setCloneNodeKeys('copy', keys),
    [ANODE_ACTION_KEY.CUT]: () => setCloneNodeKeys('cut', keys),
    [ANODE_ACTION_KEY.PASTE]: pasteNode,
    [ANODE_ACTION_KEY.RENAME]: () => (openRenameOrCreateModal.value = true),
    [ANODE_ACTION_KEY.DELETE]: () => confirmDeleteNode(keys),
  };

  ctxMenuKey.value = menuKey;
  currentNodeKey.value = key;
  currentNodeName.value = name;
  // @ts-ignore
  actions[menuKey]();
};

const openCreateModal = () => {
  currentNodeName.value = '';
  openRenameOrCreateModal.value = true;
};

const onRenameOrCreateNode = async () => {
  const menuKey = ctxMenuKey.value!;
  const name = currentNodeName.value;

  if (!name) {
    message.error('起个名字');
    return;
  }
  if (
    [ANODE_ACTION_KEY.CREATE_FOLDER, ANODE_ACTION_KEY.CREATE_FILE].includes(
      menuKey
    )
  ) {
    store.createAndInsertNode({
      name,
      // @ts-ignore
      type: menuKey,
      anchorKey: currentNodeKey.value,
    });
    message.success('新建成功');
  } else {
    store.updateOneNode(currentNodeKey.value, { name });
    message.success('重命名成功');
  }

  resetModal();
};

const resetModal = () => {
  currentNodeKey.value = '';
  currentNodeName.value = '';
  ctxMenuKey.value = undefined;
  openRenameOrCreateModal.value = false;
};

const setCloneNodeKeys = (type: 'copy' | 'cut', keys: string[]) => {
  cloneNodeKeys.type = type;
  cloneNodeKeys.keys = keys;
  message.info((type === 'copy' ? '复制' : '剪切') + '成功');
};

const pasteNode = async () => {
  store.pasteNode(currentNodeKey.value, cloneNodeKeys.keys);
  if (cloneNodeKeys.type === 'cut') {
    store.removeNode(cloneNodeKeys.keys);
  }
  message.success('粘贴成功');
};

const confirmDeleteNode = async (keys: string[]) => {
  if (showDelPrompt.value) {
    store.removeNode(keys);
    return;
  }
  Modal.confirm({
    title: '确认要删除吗？',
    okText: '确定',
    cancelText: '取消',
    content: h('div', null, [
      h('span', { style: { color: 'red' } }, '选择删除后此条数据将不可恢复'),
      h(
        'div',
        { style: { marginTop: '8px' } },
        h(
          Checkbox,
          {
            'v-model:checked': showDelPrompt.value,
            style: { marginRight: '8px' },
            onChange: ({ target: { checked } }) => {
              showDelPrompt.value = checked;
              setLocalItem('showDelPrompt', checked);
            },
          },
          '不再提示'
        )
      ),
    ]),
    onOk() {
      store.removeNode(keys);
    },
  });
};
</script>

<style scoped>
.empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
