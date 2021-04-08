import typescript from '@wessberg/rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const prod = process.env.NODE_ENV === 'production';
const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, (m) => m.toUpperCase())
  .replace(/-\w/g, (m) => m[1].toUpperCase());

export default {
  input: './src/index.ts',
  external: ['svelte'],
  output: [
    { dir: 'dist/cjs', format: 'cjs', sourcemap: prod, name },
    { dir: 'dist/esm', format: 'es', sourcemap: prod },
  ],
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(
        prod ? 'production' : 'development'
      ),
    }),
    resolve({ browser: true }),
    commonjs(),
    typescript(),
    prod && terser(),
  ],
};
