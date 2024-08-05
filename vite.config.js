import _ from "lodash";
import { defineConfig } from 'vite'
import { jsonX } from 'vite-plugin-jsonx';

import dynamicImport from 'vite-plugin-dynamic-import'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { normalizePath } from 'vite'
import path from 'path'

/** @type {import('vite').UserConfig} */
export default defineConfig({
  root: path.resolve(__dirname, 'app'),
  base: "./",
  publicDir: path.resolve(__dirname, 'app', 'public'),
  plugins: [
    jsonX(),
    dynamicImport(),
    {
      name: "markdown-loader",
      transform(code, id) {
        if (id.slice(-3) === ".md") {
          // For .md files, get the raw content
          return `export default ${JSON.stringify(code)};`;
        }
      }
    },
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, 'app', 'public')),
          dest: path.resolve(__dirname, 'dist'),
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@public': path.resolve(__dirname, 'app', 'public'),
      '@assets': path.resolve(__dirname, 'app', 'public', 'assets'),
      '@app': path.resolve(__dirname, 'app', 'src'),
    },
  },
  build: {

    target: 'esnext',
    outDir: path.resolve(__dirname, 'dist'),
    copyPublicDir: false,
    emptyOutDir: false,
    sourcemap: false,

    rollupOptions: {
      treeshake: true,
      output: {
        entryFileNames: `main.js`,
        chunkFileNames: `[hash].js`,
        assetFileNames: `[hash].[ext]`
      },
    },
  }
})
