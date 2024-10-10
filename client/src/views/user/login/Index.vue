<template>
  <Layout>
    <a-tabs destroyInactiveTabPane v-model:activeKey="activeKey" centered>
      <a-tab-pane key="usePwd" tab="账号密码登录">
        <a-form
          ref="formRef"
          size="large"
          :model="formState"
          name="password_login"
          class="login-form"
          @finish="onLogin"
          validateTrigger="submit">
          <a-form-item
            name="account"
            :rules="[
              {
                required: true,
                whitespace: true,
                message: '请输入账号',
              },
            ]">
            <a-input
              autocomplete="off"
              v-model:value="formState.account"
              placeholder="账号">
              <template #prefix>
                <UserOutlined class="form-item-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            name="password"
            :rules="[
              {
                required: true,
                message: '请输入密码',
                whitespace: true,
              },
            ]">
            <a-input-password
              autocomplete="off"
              v-model:value="formState.password"
              placeholder="密码">
              <template #prefix>
                <LockTwoTone />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item>
            <a-form-item name="remember" no-style>
              <a-checkbox v-model:checked="formState.remember">
                自动登录
              </a-checkbox>
            </a-form-item>
            <a class="login-form-forgot">忘记密码</a>
          </a-form-item>

          <a-form-item>
            <a-button
              block
              type="primary"
              html-type="submit"
              class="login-form-button">
              确定
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="usePhone" tab="手机号登录">
        <a-form
          ref="formRef"
          size="large"
          :model="formState"
          name="mobile_login"
          class="login-form"
          @finish="onLogin"
          validateTrigger="submit">
          <MobileFormItem
            v-model:code="formState.code"
            v-model:mobile="formState.phoneNumber" />

          <a-form-item>
            <a-form-item name="remember" no-style>
              <a-checkbox v-model:checked="formState.remember">
                自动登录
              </a-checkbox>
            </a-form-item>
            <a class="login-form-forgot">忘记密码</a>
          </a-form-item>

          <a-form-item>
            <a-button
              block
              type="primary"
              html-type="submit"
              :loading="commonStore.loading">
              确定
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <router-link to="/user/register">注册账户</router-link>
  </Layout>
</template>

<script setup lang="ts">
import { useCommonStore } from '@/stores/commonStore';
import { useUserStore } from '@/stores/userStore';
import { FormInstance } from 'ant-design-vue/es/form';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Layout from '../components/Layout.vue';
import MobileFormItem from '../components/MobileFormItem.vue';

interface FormState {
  account: string;
  phoneNumber: string;
  password: string;
  remember: boolean;
  code: string;
}

const router = useRouter();
const userStore = useUserStore();
const commonStore = useCommonStore();

const initState = {
  account: '',
  phoneNumber: '',
  password: '',
  remember: true,
  code: '',
};

const activeKey = ref('usePwd');
const formRef = ref<FormInstance>();
const formState = ref<FormState>(initState);

const initData = () => {
  formState.value = initState;
  formRef.value?.resetFields();
};

watch(() => activeKey.value, initData);

const onLogin = async (values: FormState) => {
  try {
    commonStore.setLoading(true);
    await userStore.login(values);
    router.replace('/workspace');
  } finally {
    commonStore.setLoading(false);
  }
};
</script>

<style scoped>
.form-item-icon {
  color: #1677ff;
}
.login-form-forgot {
  float: right;
}
</style>
