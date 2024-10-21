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
    @change="onImportNodes" />

  <section class="empty" v-if="!store.workData.length">
    <a-button block :icon="h(UploadOutlined)" @click="fileInput?.click()">
      导入json
    </a-button>
    <p />
    <a-button
      type="primary"
      block
      :icon="h(PlusOutlined)"
      @click="onCreateProjectBtnClick">
      新建项目
    </a-button>
  </section>

  <a-dropdown v-else :trigger="['contextmenu']">
    <a-directory-tree
      multiple
      draggable
      block-node
      :height="maxHeight"
      @drop="store.onDragFileNode"
      @rightClick="onRightClick"
      :tree-data="store.workData"
      :field-names="{ title: 'name' }"
      @expand="autoExpandParent = false"
      v-model:expandedKeys="expandedKeys"
      :auto-expand-parent="autoExpandParent"
      v-model:selectedKeys="store._selectedFileNodeKeys"
      :style="{ height: `${maxHeight}px`, overflow: 'auto' }">
      <template #switcherIcon="{ switcherCls }">
        <down-outlined :class="switcherCls" />
      </template>

      <template #title="{ name, key: treeKey }">
        <a-dropdown :trigger="['contextmenu']">
          <span v-if="name?.includes(searchValue)" :title="name">
            {{ name.substring(0, name.indexOf(searchValue)) }}
            <span style="color: #f50">{{ searchValue }}</span>
            {{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
          </span>
          <span v-else :title="name">{{ name }}</span>

          <template #overlay>
            <a-menu
              style="width: 120px"
              @click="(item:any) => onCtxMenuClick(treeKey, item.key)">
              <a-menu-item
                :key="k"
                v-for="(v, k) in NodeActionTitles"
                :danger="k === NODE_ACTION_KEY.DELETE"
                :style="{ display: getIsRtOptDisplay(k) ? 'none' : '' }"
                :disabled="
                  k === NODE_ACTION_KEY.PASTE && !cloneNodeInfo.keys.length
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
        @click="(item:any) => onCtxMenuClick('', item.key)">
        <a-menu-item :key="NODE_ACTION_KEY.CREATE_PROJECT">
          创建项目...
        </a-menu-item>
        <a-menu-item :key="NODE_ACTION_KEY.CREATE_FILE">
          新建页面...
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
    @ok="onModalOk"
    v-model:open="openModal">
    <a-input v-model:value="inputNameVal" placeholder="请输入名称" />
  </a-modal>
</template>

<script setup lang="ts">
import {
  createFileNode,
  createFolderNode,
  type WorkDataNodeType,
  type FileNode,
  type FolderNode,
} from '@/api/workData';
import { getLocalItem, getWinHeight, setLocalItem } from '@/share';
import {
  NODE_ACTION_KEY,
  NodeActionTitles,
  DOWNLOAD_FILE_TYPE,
} from '@/share/enums';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { Checkbox, message, Modal } from 'ant-design-vue';
import { type EventDataNode } from 'ant-design-vue/es/tree';
import {
  h,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue';

const store = useWorkspaceStore();

const rtOptVisbile = reactive({
  del: true,
  cut: true,
  paste: true,
  create: true,
  import: true,
  download: true,
  rename: true,
});

const cloneNodeInfo = reactive<{ keys: string[]; type: 'copy' | 'cut' }>({
  keys: [],
  type: 'copy',
});

const maxHeight = ref(getWinHeight() - 58);
const fileInput = ref<HTMLInputElement>();

const showDelPrompt = ref(false);
const openModal = ref(false);
const autoExpandParent = ref(false);

const searchValue = ref('');
const inputNameVal = ref('');
const expandedKeys = ref<string[]>([]);
const ctxMenuKey = ref<NODE_ACTION_KEY>();
const obtainedNode = ref<WorkDataNodeType>();

const setTreeMaxHeight = () => (maxHeight.value = getWinHeight() - 58);

onBeforeMount(() => {
  showDelPrompt.value = getLocalItem('showDelPrompt');
  setTimeout(() => {
    expandedKeys.value = store.expandedFileNodeKeys;
  }, 0);
});
onMounted(() => {
  window.addEventListener('resize', setTreeMaxHeight);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', setTreeMaxHeight);
});

watch(
  () => expandedKeys.value,
  newVal => {
    const val = newVal.filter(item => item?.endsWith(';fld'));
    store.setExpandedFileNodeKeys(val);
  }
);

const onSearch = (value: string) => {
  const expanded = store.queryKeysByName(value);
  searchValue.value = value;
  expandedKeys.value = expanded;
  autoExpandParent.value = true;
  store.setExpandedFileNodeKeys(expanded);
};

watch(() => searchValue.value, onSearch);

const onImportNodes = async () => {
  const fs = fileInput.value?.files;
  if (fs?.length) {
    try {
      await store.import(fs[0], obtainedNode.value!.key);
    } catch (e: Error) {
      message.error(
        e.message ?? '无法识别文件内容，请确保数据格式符合既定标准'
      );
    } finally {
      fileInput.value!.value = '';
    }
  }
};

const getIsRtOptDisplay = (k: NODE_ACTION_KEY): boolean => {
  return (
    (k === NODE_ACTION_KEY.CUT && !rtOptVisbile.cut) ||
    (k === NODE_ACTION_KEY.DELETE && !rtOptVisbile.del) ||
    (k === NODE_ACTION_KEY.PASTE && !rtOptVisbile.paste) ||
    (k === NODE_ACTION_KEY.RENAME && !rtOptVisbile.rename) ||
    (k === NODE_ACTION_KEY.IMPORT && !rtOptVisbile.import) ||
    (k === NODE_ACTION_KEY.DOWNLOAD && !rtOptVisbile.download) ||
    ([NODE_ACTION_KEY.CREATE_FOLDER, NODE_ACTION_KEY.CREATE_FILE].includes(k) &&
      !rtOptVisbile.create)
  );
};

const onCreateProjectBtnClick = () => {
  ctxMenuKey.value = NODE_ACTION_KEY.CREATE_PROJECT;
  onOpenModal();
};

const onRightClick = ({ event, node }: { event: any; node: EventDataNode }) => {
  event.stopPropagation();
  obtainedNode.value = node.dataRef! as WorkDataNodeType;

  // @ts-ignore
  const hidden = !node.isRoot && !node.isLeaf;
  // @ts-ignore
  const hidden2 = node.name !== 'src' && node.pos !== '0-0-0';

  rtOptVisbile.del = hidden2;
  rtOptVisbile.cut = hidden2;
  rtOptVisbile.rename = hidden2;
  rtOptVisbile.create = hidden;
  rtOptVisbile.paste = hidden;
  rtOptVisbile.import = hidden;
  rtOptVisbile.download = node.isFile;
};

const onCtxMenuClick = (key: string, menuKey: NODE_ACTION_KEY) => {
  const keys = store.selectedFileNodeKeys.includes(key)
    ? store.selectedFileNodeKeys
    : [key];

  const actions = {
    [NODE_ACTION_KEY.CREATE_PROJECT]: onOpenModal,
    [NODE_ACTION_KEY.CREATE_FOLDER]: onOpenModal,
    [NODE_ACTION_KEY.CREATE_FILE]: onOpenModal,
    [NODE_ACTION_KEY.COPY]: () => setCloneNodeKeys('copy', keys),
    [NODE_ACTION_KEY.CUT]: () => setCloneNodeKeys('cut', keys),
    [NODE_ACTION_KEY.PASTE]: pasteNode,
    [NODE_ACTION_KEY.IMPORT]: () => {
      fileInput.value?.click();
    },
    [NODE_ACTION_KEY.DOWNLOAD]: () => {
      store.exportSingle(DOWNLOAD_FILE_TYPE.VUE, obtainedNode.value!);
    },
    [NODE_ACTION_KEY.RENAME]: () => (openModal.value = true),
    [NODE_ACTION_KEY.DELETE]: () => onDelete(keys),
  };

  ctxMenuKey.value = menuKey;
  // @ts-ignore
  actions[menuKey]();
};

const onOpenModal = () => {
  if (ctxMenuKey.value !== NODE_ACTION_KEY.RENAME) {
    inputNameVal.value = '';
  }
  openModal.value = true;
};

const onModalOk = async () => {
  if (!inputNameVal.value) {
    message.error('请输入名称');
    return;
  }

  const menuKey = ctxMenuKey.value!;

  const isCreateNode: boolean = [
    NODE_ACTION_KEY.CREATE_PROJECT,
    NODE_ACTION_KEY.CREATE_FOLDER,
    NODE_ACTION_KEY.CREATE_FILE,
  ].includes(menuKey);

  if (isCreateNode) {
    try {
      let rootKey = obtainedNode.value?.rootKey ?? '';
      let data: FolderNode | FileNode;

      if (menuKey === NODE_ACTION_KEY.CREATE_FILE) {
        data = await createFileNode(rootKey, inputNameVal.value);
      } else {
        const isRoot = menuKey === NODE_ACTION_KEY.CREATE_PROJECT;
        if (isRoot) {
          rootKey = '';
          obtainedNode.value = undefined;
        }

        data = await createFolderNode({
          name: inputNameVal.value,
          rootKey,
          isRoot,
        });
      }

      store.insertNode(data as WorkDataNodeType, obtainedNode.value);
      message.success('新建成功');
    } catch (e) {
      console.log(e);
    }
  } else {
    store.updateNode(obtainedNode.value!, { name: inputNameVal.value });
    message.success('重命名成功');
  }

  obtainedNode.value = undefined;
  ctxMenuKey.value = undefined;
  openModal.value = false;
  inputNameVal.value = '';
};

const setCloneNodeKeys = (type: 'copy' | 'cut', keys: string[]) => {
  cloneNodeInfo.type = type;
  cloneNodeInfo.keys = keys;
  message.info((type === 'copy' ? '复制' : '剪切') + '成功');
};

const pasteNode = async () => {
  const isCut = cloneNodeInfo.type === 'cut';
  store.pasteFileNode(obtainedNode.value!, cloneNodeInfo.keys, isCut);
  if (isCut) {
    cloneNodeInfo.keys.forEach(key => {
      store.removeNode(obtainedNode.value!.rootKey, key);
    });
  }
};

const onDelete = async (keys: string[]) => {
  const handler = () => {
    keys.forEach(key => {
      store.removeNode(obtainedNode.value!.rootKey, key);
    });
  };

  if (!showDelPrompt.value) {
    handler();
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
    onOk: handler,
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
