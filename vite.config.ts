import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ElementPlus from 'unplugin-element-plus/vite'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      plugins: [
        vue(),
        vueJsx(),
        dts({
          include: ['src/index.ts', 'src/TiptapEditor.vue', 'src/components', 'src/tiptap-extension'],
          outDir: 'dist',
          rollupTypes: true,
          tsconfigPath: './tsconfig.app.json',
        }),
      ],
      build: {
        copyPublicDir: false,
        lib: {
          entry: './src/index.ts',
          name: 'TiptapEditor',
          fileName: 'tiptap-editor',
          formats: ['es', 'umd'],
        },
        rollupOptions: {
          external: [
            'vue',
            'element-plus',
            /^@element-plus\//,
            /^@tiptap\//,
            'katex',
          ],
          output: {
            globals: {
              vue: 'Vue',
              'element-plus': 'ElementPlus',
            },
          },
        },
      },
    }
  }

  return {
    plugins: [vue(), vueJsx(), ElementPlus({})],
    build: {
      outDir: 'dist-app',
    },
  }
})
