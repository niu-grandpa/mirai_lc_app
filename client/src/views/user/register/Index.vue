<template>
  <Layout>
    <a-form
      ref="formRef"
      size="large"
      :rules="rules"
      name="register"
      :model="formState"
      validateTrigger="submit"
      @finish="onRegister">
      <a-form-item name="nickname">
        <a-input v-model:value="formState.nickname" placeholder="昵称" />
      </a-form-item>

      <a-form-item name="password">
        <a-input-password
          v-model:value="formState.password"
          placeholder="密码"
          autocomplete="off">
          <template #prefix>
            <LockTwoTone />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item name="checkPass">
        <a-input-password
          v-model:value="formState.checkPass"
          type="password"
          placeholder="确认密码"
          autocomplete="off">
          <template #prefix>
            <LockTwoTone />
          </template>
        </a-input-password>
      </a-form-item>

      <MobileFormItem
        v-model:code="formState.code"
        v-model:mobile="formState.phoneNumber" />

      <a-form-item>
        <a-button
          block
          type="primary"
          html-type="submit"
          :loading="commonStore.loading">
          注册
        </a-button>
      </a-form-item>
    </a-form>

    <router-link to="/user/login">切换登录</router-link>
  </Layout>
</template>

<script setup lang="ts">
import { useCommonStore } from '@/stores/commonStore';
import { useUserStore } from '@/stores/userStore';
import { FormInstance, type Rule } from 'ant-design-vue/es/form';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Layout from '../components/Layout.vue';
import MobileFormItem from '../components/MobileFormItem.vue';

interface FormState {
  nickname: string;
  password: string;
  checkPass: string;
  phoneNumber: string;
  code: string;
}

const router = useRouter();
const userStore = useUserStore();
const commonStore = useCommonStore();

const initState: FormState = {
  nickname: '',
  password: '',
  checkPass: '',
  phoneNumber: '',
  code: '',
};

const formRef = ref<FormInstance>();
const formState = ref<FormState>(initState);

const validateName = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('请输入昵称');
  } else {
    if (!/^[\u4E00-\u9FA5A-Za-z0-9_]{1,20}$/.test(value)) {
      return Promise.reject('只允许汉字、字母、数字和下划线, 最长20个字符');
    }
    return Promise.resolve();
  }
};

const validatePass = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('请输入密码');
  } else {
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/.test(value)) {
      return Promise.reject('至少8个字符, 包含字母、数字和特殊字符');
    }
    if (formState.value.checkPass !== '') {
      formRef.value!.validateFields('checkPass');
    }
    return Promise.resolve();
  }
};

const validatePass2 = async (_rule: Rule, value: string) => {
  if (value === '') {
    return Promise.reject('请输入确认密码');
  } else if (value !== formState.value.password) {
    return Promise.reject('两次输入的密码不匹配!');
  } else {
    return Promise.resolve();
  }
};

const rules: Record<string, Rule[]> = {
  nickname: [{ required: true, whitespace: true, validator: validateName }],
  password: [
    {
      required: true,
      whitespace: true,
      validator: validatePass,
    },
  ],
  checkPass: [
    {
      required: true,
      whitespace: true,
      validator: validatePass2,
    },
  ],
};

const onRegister = async (values: FormState) => {
  try {
    commonStore.setLoading(true);
    await userStore.register(values);
    router.replace('/workspace');
  } finally {
    commonStore.setLoading(false);
  }
};
</script>

<style scoped></style>
