<template>
  <section class="wrapper">
    <LeftPanel :active-key="activeKey" />
    <RightOptions @toogle="k => (activeKey = k)" />
  </section>
</template>

<script setup lang="ts">
import { SIDEBAR_OPTIONS } from '@/config/sidebar';
import { ref } from 'vue';
import LeftPanel from './LeftPanel/Index.vue';
import RightOptions from './RightOptions.vue';

const activeKey = ref<SIDEBAR_OPTIONS>(SIDEBAR_OPTIONS.RESOURCE);
</script>

<style>
.wrapper {
  display: flex;

  .icon-box {
    margin-bottom: 28px;
    font-size: 24px;
    text-align: center;
    cursor: pointer;
    opacity: 0.6;
    color: #fff;
    &:hover {
      opacity: 1;
    }
    &.active {
      opacity: 1;
      border-right: 2px solid orange;
    }
  }
}
</style>
