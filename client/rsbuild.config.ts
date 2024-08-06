import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import path from 'path';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/rspack';

export default defineConfig({
  plugins: [pluginVue()],
  tools: {
    rspack: {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src/'),
          public: path.resolve(__dirname, 'public/'),
        },
      },
      plugins: [
        Components({
          dts: 'types/components.d.ts',
          resolvers: [
            AntDesignVueResolver({ importStyle: false, resolveIcons: true }),
          ],
        }),
      ],
    },
  },
});
