import { defineConfig } from 'astro/config'
import glsl from 'vite-plugin-glsl'

// https://astro.build/config
export default defineConfig({
  site: 'https://nemutas.github.io',
  base: '/lk-effect',
  vite: {
    plugins: [glsl()],
  },
})
