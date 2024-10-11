<template>
  <section class="right">
    <div class="top">
      <div
        v-for="item in options.slice(0, -2)"
        :class="['icon-box', { active: item.active }]"
        :title="item.title"
        :key="item.key"
        @click="handleToogle(item.key)">
        <component :is="item.icon" />
      </div>
    </div>

    <div class="bottom">
      <template v-for="item in options.slice(-2)" :key="item.key">
        <a-popover
          v-if="item.key === SIDEBAR_OPTIONS.USER"
          v-model:open="visible"
          trigger="click"
          :arrow="false"
          placement="leftBottom">
          <template #content>
            <template v-if="!userStore.account">
              <a-button type="text" @click="hide('/user/login')">
                用户登录
              </a-button>
              <div />
              <a-button type="text" @click="hide('/user/register')">
                注册
              </a-button>
            </template>

            <template v-else>
              <a-button type="text" @click="hide('/user')">个人中心</a-button>
              <div />
              <a-button type="text">退出登陆</a-button>
              <div />
              <a-button type="text" danger>注销</a-button>
            </template>
          </template>

          <div class="icon-box" :title="item.title">
            <component :is="item.icon" />
          </div>
        </a-popover>

        <div
          v-else
          :class="['icon-box', { active: item.active }]"
          :title="item.title"
          @click="handleToogle(item.key)">
          <component :is="item.icon" />
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import sidebarConfig, { SIDEBAR_OPTIONS } from '@/config/sidebar';
import { useUserStore } from '@/stores/userStore';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const emits = defineEmits<{
  (e: 'toogle', key: SIDEBAR_OPTIONS): void;
}>();

const router = useRouter();
const userStore = useUserStore();

const options = ref(sidebarConfig.options);
const visible = ref<boolean>(false);

const hide = (path?: string) => {
  visible.value = false;
  path && router.push(path);
};

const handleToogle = (key: SIDEBAR_OPTIONS) => {
  if (key === SIDEBAR_OPTIONS.USER) {
    return;
  }
  options.value.forEach(item => {
    item.active = item.key === key;
  });
  emits('toogle', key);
};
</script>

<style scoped>
.right {
  width: 42px;
  height: 100vh;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  .top {
    width: 97%;
    flex: 1;
  }

  .bottom {
    width: 97%;
    height: 120px;
  }
}
</style>
