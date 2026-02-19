import * as esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/workshop.js',
  format: 'esm',
  platform: 'node',
  target: 'node20',
  sourcemap: true,
  jsx: 'automatic',
  jsxImportSource: '@opentui/react',
  external: [
    '@opentui/core',
    '@opentui/react',
    'react',
    'react/jsx-runtime',
    'react-devtools-core',
    '@github/copilot-sdk',
    'node:*',
  ],
});

if (isWatch) {
  await ctx.watch();
  console.log('✓ Watching for changes...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('✓ Built dist/workshop.js');
}
