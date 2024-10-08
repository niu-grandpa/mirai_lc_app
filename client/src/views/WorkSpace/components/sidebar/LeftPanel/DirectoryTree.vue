<template>
  <a-input-search
    v-model:value="searchValue"
    style="margin-bottom: 8px"
    placeholder="搜索文件" />

  <input
    ref="fileInput"
    type="file"
    accept=".json"
    style="display: none"
    @change="onUploadAndAddTreeNode" />

  <section class="empty" v-if="!workspaceStore.workData.length">
    <a-button block :icon="h(UploadOutlined)" @click="fileInput?.click()">
      导入json
    </a-button>
    <p />
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
      @drop="nodeManagerStore.dragNode"
      @rightClick="onRightClick"
      :tree-data="workspaceStore.workData"
      :field-names="{ title: 'name' }"
      @expand="autoExpandParent = false"
      v-model:expandedKeys="expandedKeys"
      :auto-expand-parent="autoExpandParent"
      v-model:selectedKeys="nodeManagerStore._selectedKeys"
      :style="{ height: `${maxHeight}px`, overflow: 'auto' }">
      <template #switcherIcon="{ switcherCls }">
        <down-outlined :class="switcherCls" />
      </template>

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
        <a-menu-item :key="ANODE_ACTION_KEY.CREATE_PROJECT">
          创建项目...
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
      ANodeActionTitles[
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
import { FolderANode, type FileANode } from '@/share/abstractNode';
import {
  ANODE_ACTION_KEY,
  ANodeActionTitles,
  DOWNLOAD_FILE_TYPE,
} from '@/share/enums';
import { useNodeManagerStore } from '@/stores/nodeManagerStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons-vue';
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

const workspaceStore = useWorkspaceStore();
const nodeManagerStore = useNodeManagerStore();

const searchValue = ref('');
const currentNodeKey = ref('');
const currentNodeName = ref('');
const showCreate = ref(true);
const showPaste = ref(true);
const showImport = ref(true);
const showDownload = ref(true);
const showDelPrompt = ref(false);
const autoExpandParent = ref(false);
const expandedKeys = ref<string[]>([]);
const ctxMenuKey = ref<ANODE_ACTION_KEY>();
const openRenameOrCreateModal = ref(false);
const maxHeight = ref(getWinHeight() - 58);
const fileInput = ref<HTMLInputElement>();
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
  expandedKeys.value = nodeManagerStore.expandedKeys;
});

watch(
  () => expandedKeys.value,
  newVal => {
    const val = newVal.filter(item => item?.endsWith(FolderKeySuffix));
    nodeManagerStore.updateExpandedKeys(val);
  }
);

const onSearch = (value: string) => {
  const expanded = workspaceStore.findKeysByName(value);
  nodeManagerStore.updateExpandedKeys(expanded);
  searchValue.value = value;
  autoExpandParent.value = true;
};

watch(() => searchValue.value, onSearch);

const onUploadAndAddTreeNode = async () => {
  const fs = fileInput.value?.files;
  if (fs?.length) {
    try {
      await nodeManagerStore.importWorkFile(fs[0], currentNodeKey.value);
    } catch (e: Error) {
      message.error(
        e.message ?? '无法识别文件内容，请确保数据格式符合既定标准'
      );
    } finally {
      fileInput.value!.value = '';
    }
  }
};

const isCtxOptHidden = (k: ANODE_ACTION_KEY) => {
  return (
    (k === ANODE_ACTION_KEY.PASTE && !showPaste.value) ||
    (k === ANODE_ACTION_KEY.IMPORT && !showImport.value) ||
    (k === ANODE_ACTION_KEY.DOWNLOAD && !showDownload.value) ||
    ([ANODE_ACTION_KEY.CREATE_FOLDER, ANODE_ACTION_KEY.CREATE_FILE].includes(
      k
    ) &&
      !showCreate.value)
  );
};

const onFirstCreate = () => {
  ctxMenuKey.value = ANODE_ACTION_KEY.CREATE_PROJECT;
  openCreateModal();
};

const onRightClick = ({
  event,
  node,
}: {
  event: any;
  node: FolderANode & FileANode;
}) => {
  event.stopPropagation();
  const hidden = !node.isRoot && !node.isLeaf;
  showCreate.value = hidden;
  showPaste.value = hidden;
  showImport.value = hidden;
  showDownload.value = node.isFile;
};

const onCtxMenuClick = (
  key: string,
  menuKey: ANODE_ACTION_KEY,
  name: string
) => {
  const keys = nodeManagerStore.selectedKeys.includes(key)
    ? nodeManagerStore.selectedKeys
    : [key];
  const actions = {
    [ANODE_ACTION_KEY.CREATE_PROJECT]: openCreateModal,
    [ANODE_ACTION_KEY.CREATE_FOLDER]: openCreateModal,
    [ANODE_ACTION_KEY.CREATE_FILE]: openCreateModal,
    [ANODE_ACTION_KEY.COPY]: () => setCloneNodeKeys('copy', keys),
    [ANODE_ACTION_KEY.CUT]: () => setCloneNodeKeys('cut', keys),
    [ANODE_ACTION_KEY.PASTE]: pasteNode,
    [ANODE_ACTION_KEY.IMPORT]: () => {
      fileInput.value?.click();
    },
    [ANODE_ACTION_KEY.DOWNLOAD]: () => {
      nodeManagerStore.exportToFile(DOWNLOAD_FILE_TYPE.VUE, key);
    },
    [ANODE_ACTION_KEY.RENAME]: () => (openRenameOrCreateModal.value = true),
    [ANODE_ACTION_KEY.DELETE]: () => onDeleteNode(keys),
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
    message.error('请输入内容');
    return;
  }

  const isCreate: boolean = [
    ANODE_ACTION_KEY.CREATE_PROJECT,
    ANODE_ACTION_KEY.CREATE_FOLDER,
    ANODE_ACTION_KEY.CREATE_FILE,
  ].includes(menuKey);
  if (isCreate) {
    try {
      await workspaceStore.createAndInsertNode({
        name,
        // @ts-ignore
        type: menuKey,
        anchorKey: currentNodeKey.value,
        isRoot: menuKey === ANODE_ACTION_KEY.CREATE_PROJECT,
      });
      message.success('新建成功');
    } catch (error: Error) {
      message.error(error.message);
    }
  } else {
    try {
      workspaceStore.updateNode(currentNodeKey.value, { name });
      message.success('重命名成功');
    } catch (error: Error) {
      message.error(error.message);
    }
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
  nodeManagerStore.pasteNode(currentNodeKey.value, cloneNodeKeys.keys);
  if (cloneNodeKeys.type === 'cut') {
    nodeManagerStore.removeNodes(cloneNodeKeys.keys);
  }
  message.success('粘贴成功');
};

const onDeleteNode = async (keys: string[]) => {
  const fn = () => {
    try {
      nodeManagerStore.removeNodes(keys);
    } catch (error: Error) {
      message.error(error.message);
    }
  };

  if (showDelPrompt.value) {
    fn();
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
    onOk: fn,
  });
};
</script>

<style scoped>
.empty {
  width: 80%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
