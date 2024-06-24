import { defineConfig } from 'tsup';
import { glob } from 'glob';

const entryPoints = glob.sync('src/**/*.ts');

export default defineConfig({
  entry: entryPoints,
  format: ['esm' ],
  target: 'es2022',
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
});
