import HljsVuePlugin from '@highlightjs/vue-plugin';
import 'ant-design-vue/dist/reset.css';
import 'highlight.js/lib/common';
import 'highlight.js/styles/atom-one-dark.css';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes, { handleRouteRedirect } from './routes';

const app = createApp(App);

const vueRouter = createRouter({
  history: createWebHistory(),
  routes,
});

const pinia = createPinia();

app.use(vueRouter).use(pinia).use(HljsVuePlugin).mount('#root');

handleRouteRedirect(vueRouter);
