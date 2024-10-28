import { type Router, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from './stores/userStore';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/home/Index.vue'),
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('@/components/NotFound.vue'),
  },
  {
    path: '/user',
    children: [
      {
        path: '',
        component: () => import('@/views/user/Index.vue'),
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/user/login/Index.vue'),
      },
      {
        path: 'register',
        component: () => import('@/views/user/register/Index.vue'),
      },
    ],
  },
  {
    path: '/vip',
    component: () => import('@/views/Vip.vue'),
  },
  {
    path: '/workspace',
    meta: {
      title: '工作区',
    },
    component: () => import('@/views/workSpace/Index.vue'),
  },
];

export default routes;

export function handleRouteRedirect(router: Router) {
  const userStore = useUserStore();

  router.beforeEach((to, _) => {
    if (userStore.account && (to.name === 'index' || to.name === 'login')) {
      router.replace('/workspace');
    }
  });
}
