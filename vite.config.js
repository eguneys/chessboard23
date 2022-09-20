import { resolve } from 'path'
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solidPlugin({ hot: false }),
  ],
  build: {
    sourcemap: 'inline',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Chessboard23',
      fileName: 'chessboard23'
    },
    rollupOptions: {
      external: ['solid-js', 'solid-play']
    }
  },
})
