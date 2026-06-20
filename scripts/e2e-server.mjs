import { spawnSync } from 'node:child_process';

const build = spawnSync('npm run build:dev', {
  cwd: process.cwd(),
  shell: true,
  stdio: 'inherit',
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

process.argv[2] = '8100';
await import('./serve-spa.mjs');
