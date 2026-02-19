import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/workshop.js',
  format: 'esm',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  jsx: 'automatic',
  jsxImportSource: 'react',
  external: [
    'ink',
    'react',
    'react/jsx-runtime',
    'react-devtools-core',
    'yoga-wasm-web',
    '@github/copilot-sdk',
    'node:*',
  ],
};

if (watch) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
  console.log('👀 Watching for changes...');
} else {
  await esbuild.build(config);
  console.log('✓ Built dist/workshop.js');
}
