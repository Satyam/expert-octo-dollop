import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'public',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    typescript({
      lib: ['es2021', 'dom', 'dom.iterable'],
      baseUrl: 'src',
      moduleResolution: 'node',
    }),
    copy({
      targets: [{ src: 'src/assets/*', dest: 'public' }],
    }),
  ],
};
