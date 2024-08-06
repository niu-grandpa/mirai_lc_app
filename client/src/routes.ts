import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./views/WorkSpace.vue'),
  },
  {
    path: '/index',
    redirect: '/',
  },
  {
    path: '/oauth',
    component: () => import('./views/OAuth.vue'),
  },
  {
    path: '/user',
    component: () => import('./views/User.vue'),
  },
  {
    path: '/vip',
    component: () => import('./views/Vip.vue'),
  },
  {
    path: '/workspace',
    component: () => import('./views/WorkSpace.vue'),
  },
];

export default routes;
