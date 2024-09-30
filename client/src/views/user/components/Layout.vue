<template>
  <a-flex vertical :style="boxStyle" justify="center" align="center">
    <a-typography-link href="/">
      <a-typography-title :level="2">
        <img :src="logo" class="logo" alt="logo" />
        <span class="title">Mirai Design</span>
      </a-typography-title>
    </a-typography-link>
    <a-typography-text type="secondary" style="margin-bottom: 40px">
      开启高效设计的新篇章，让创意与实现无缝对接
    </a-typography-text>

    <div class="form-box">
      <slot />
    </div>

    <a-flex class="footer" vertical justify="center" align="center">
      <a-flex :gap="42">
        <a class="extra-link">帮助</a>
        <a class="extra-link">隐私</a>
        <a class="extra-link">条款</a>
      </a-flex>
      <p class="copyright">
        Copyright © 2024
        <a
          style="color: #000000a6"
          href="https://github.com/niu-grandpa"
          target="__blank">
          <GithubOutlined />&nbsp;niu-grandpa
        </a>
      </p>
    </a-flex>
  </a-flex>
</template>

<script setup lang="ts">
import background from '@/assets/background.svg';
import logo from 'public/logo.svg';
import { type CSSProperties } from 'vue';

const boxStyle: CSSProperties = {
  width: '100%',
  height: '100vh',
  background: `url(${background})`,
  backgroundSize: '100%',
  backgroundPosition: 'center 110px',
  backgroundRepeat: 'no-repeat',
};
</script>

<style scoped>
.logo {
  height: 46px;
  margin-right: 16px;
  vertical-align: top;
  border-style: none;
}
.title {
  position: relative;
  top: 4px;
}
.form-box {
  width: 367px;
}
.footer {
  width: 100%;
  position: relative;
  top: 84px;
  .extra-link {
    color: #000000a6;
  }
  .copyright {
    margin-top: 10px;
    font-size: 14px;
    color: #000000a6;
  }
}
</style>
