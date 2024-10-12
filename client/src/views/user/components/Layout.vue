<template>
  <a-flex vertical :style="boxStyle" justify="center" align="center">
    <a-typography-link href="/">
      <a-typography-title :level="2">
        <img :src="logo" class="logo" alt="logo" />
        <span class="title">Visual Web Design</span>
      </a-typography-title>
    </a-typography-link>
    <span class="subtitle" style="margin-bottom: 40px">
      开启高效可视化设计的新篇章，让创意与实现无缝对接
    </span>

    <div class="form-box">
      <slot />
    </div>
  </a-flex>

  <a-flex class="footer" vertical justify="center" align="center">
    <a-flex :gap="42">
      <a class="extra-link">帮助</a>
      <a class="extra-link">隐私</a>
      <a class="extra-link">条款</a>
    </a-flex>
    <p class="copyright">
      Copyright © {{ new Date().getFullYear() }}&nbsp;
      <a
        style="color: #ffffff"
        href="https://github.com/niu-grandpa"
        target="__blank">
        <GithubOutlined />&nbsp;niu-grandpa
      </a>
    </p>
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
  backgroundColor: '#141414',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center 110px',
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
.subtitle {
  color: #ffffff;
}
.form-box {
  width: 367px;
}
.footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  .extra-link {
    color: #ffffff;
  }
  .copyright {
    margin-top: 10px;
    font-size: 14px;
    color: #ffffff;
  }
}
</style>
