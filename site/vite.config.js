import * as path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { VitePWA } from 'vite-plugin-pwa';

import tDocPlugin from './plugin-doc';
import pwaConfig from './pwaConfig';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/vue-next/' : './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../'),
      '@common': path.resolve(__dirname, '../src/_common'),
      'tdesign-vue-next': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 17000,
    open: '/',
    https: false,
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: '../_site',
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('td-'),
        },
      },
    }),
    vueJsx({
      isCustomElement: (tag) => tag.startsWith('td-'),
    }),
    tDocPlugin(),
    VitePWA(pwaConfig),
  ],
});
