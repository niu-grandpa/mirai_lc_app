<template>
  <a-form-item
    name="phoneNumber"
    :rules="[
      {
        required: true,
        whitespace: true,
        min: 11,
        max: 11,
        message: '请输入正确的手机号码',
        pattern: /^1[3-9]\d{9}$/,
      },
    ]">
    <a-input v-model:value="mobile" placeholder="手机号">
      <template #prefix>
        <MobileTwoTone />
      </template>
    </a-input>
  </a-form-item>

  <a-form-item
    name="code"
    :rules="[
      {
        required: true,
        min: 6,
        max: 6,
        message: '验证码有误',
        whitespace: true,
      },
    ]">
    <a-flex justify="space-between">
      <a-input
        v-model:value="code"
        placeholder="验证码"
        style="max-width: 66.6%">
        <template #prefix>
          <MailTwoTone />
        </template>
      </a-input>
      <a-button :disabled="disabled" style="font-size: 14px" @click="onGetCode">
        {{ count ? `${count}秒后获取` : '获取验证码' }}
      </a-button>
    </a-flex>
  </a-form-item>
</template>

<script setup lang="ts">
import { sendSmsCode } from '@/api/user';
import { message } from 'ant-design-vue';
import { ref, watch } from 'vue';

const emits = defineEmits<{
  (e: 'update:mobile', value: string): void;
  (e: 'update:code', value: string): void;
}>();

const timer = ref();
const count = ref(0);
const code = ref('');
const mobile = ref('');
const disabled = ref(false);

watch(
  () => code.value,
  newVal => {
    emits('update:code', newVal);
  }
);

watch(
  () => mobile.value,
  newVal => {
    emits('update:mobile', newVal);
  }
);

const countdown = () => {
  if (!--count.value) {
    clearInterval(timer.value);
    timer.value = null;
    disabled.value = false;
  }
};

const onGetCode = async () => {
  if (timer.value) return;
  if (!/^1[3-9]\d{9}$/.test(mobile.value)) {
    return message.error('请输入正确的手机号码');
  }
  try {
    await sendSmsCode(mobile.value);
    count.value = 60;
    disabled.value = true;
    message.success('验证码已发送');
    timer.value = setInterval(countdown, 1000);
  } catch (error) {
    console.log(error);
  }
};
</script>
