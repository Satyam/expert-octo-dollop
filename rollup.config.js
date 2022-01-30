import typescript from '@rollup/plugin-typescript';
import html from 'rollup-plugin-html';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'public',
    format: 'es',
    sourceMap: true,
  },
  plugins: [
    typescript({
      lib: ['es2021', 'dom', 'dom.iterable'],
      baseUrl: 'src',
      moduleResolution: 'node',
    }),
    html({
      include: '**/*.html',

      htmlMinifierOptions: {
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        conservativeCollapse: true,
        minifyJS: true,
      },
    }),
    copy({
      targets: [
        { src: 'src/assets/*', dest: 'public' },
        { src: 'src/index.html', dest: 'public' },
      ],
    }),
  ],
};
