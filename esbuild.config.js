import * as esbuild from 'esbuild';

await esbuild.build({
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
    '@github/copilot-sdk',
    'node:*',
  ],
});

console.log('✓ Built dist/workshop.js');
