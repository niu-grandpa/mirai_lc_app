<template>
  <a-alert v-if="visible" closable :message="data.title" :after-close="onClose">
    <template #description>
      <div v-if="props.type === 'download'" style="text-align: right">
        <a-progress :percent="percent" size="small" :status="status" />
        <a :href="data.url" v-if="percent === 100">下载</a>
        <span v-else style="color: #00000040">已过期</span>
      </div>
      <div v-else>{{ data.content }}</div>
    </template>
  </a-alert>
</template>

<script setup lang="ts">
import {
  useNotificationStore,
  type NotificationDownload,
  type NotificationNormal,
  type NotificationType,
} from '@/stores/notificationStore';
import { message } from 'ant-design-vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{
  type: NotificationType;
  data: any;
}>();

const store = useNotificationStore();

const visible = ref<boolean>(true);
const percent = ref(0);
const status = ref('active');
const interval = ref(0);
const data = ref<NotificationNormal & NotificationDownload>(props.data);

const onClose = () => {
  visible.value = false;
  store.removeOne('download', data.value.createdAt);
};

const clear = () => {
  interval.value && clearInterval(interval.value);
};

const simulateLoading = () => {
  let progress = 0;
  const maxProgress = 99;
  interval.value = setInterval(() => {
    // 生成0到99之间的随机数
    const randomIncrement = Math.floor(Math.random() * 10);
    progress += randomIncrement;
    // 控制进度不超过100
    if (progress >= maxProgress) {
      progress = maxProgress;
      clear();
    }
    percent.value = progress;
  }, 500);
};

if (props.type === 'download' && data.value.status !== 2) {
  onBeforeUnmount(clear);
  onMounted(async () => {
    simulateLoading();
    try {
      // fetch data.data
      clear();
      percent.value = 100;
      data.value.status = 0;
      status.value = 'success';
      data.value.url = 'xxxxxx';
      message.success(
        `${data.value.title}导出完成，请到消息中心下载通知内查看并下载`
      );
    } catch {
      clear();
      data.value.status = 1;
      status.value = 'exception';
      message.error(`${data.value.title}导出失败，请稍后重试!`);
    } finally {
      store.updateOne(props.type, data.value);
    }
  });
}
</script>

<style scoped>
.item {
  margin-bottom: 8px;
}
</style>
