import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'public',
    format: 'es',
    sourceMap: true,
  },
  plugins: [typescript({ lib: ['es2021', 'dom', 'dom.iterable'] })],
};
