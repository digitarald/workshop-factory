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
});

console.log('✓ Built dist/workshop.js');
