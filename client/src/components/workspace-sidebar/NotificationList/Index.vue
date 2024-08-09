<template>
  <a-tabs centered v-model:active-key="tab">
    <a-tab-pane tab="消息" key="normal">
      <a-empty v-if="!store.list.normal.length" />
      <NoticeCard
        v-else
        type="normal"
        v-for="item in store.list.normal"
        :key="item.createdAt"
        :data="item" />
    </a-tab-pane>
    <a-tab-pane tab="下载" key="download">
      <a-empty v-if="!store.list.download.length" />
      <NoticeCard
        v-else
        type="download"
        v-for="item in store.list.download"
        :key="item.createdAt"
        :data="item" />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notificationStore';
import { ref } from 'vue';
import NoticeCard from './Card.vue';

const store = useNotificationStore();

const tab = ref('normal');
</script>
