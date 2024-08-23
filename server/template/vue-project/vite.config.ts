import vue from '@vitejs/plugin-vue';
import path from 'path';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      dts: 'types/components.d.ts',
      resolvers: [
        // 自动导入 Ant Design Vue 组件
        AntDesignVueResolver({ importStyle: false, resolveIcons: true }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      public: path.resolve(__dirname, 'public'),
      // 你可以根据需要添加更多别名
    },
  },
});
