import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const extraArguments = process.argv.slice(2).join(' ');
const build = spawnSync('npm run build:dev', {
  cwd: process.cwd(),
  shell: true,
  encoding: 'utf8',
});

if (build.status !== 0) {
  process.stdout.write(build.stdout ?? '');
  process.stderr.write(build.stderr ?? '');
  process.exit(build.status ?? 1);
}

console.log('Build E2E completado.');

const server = spawn(process.execPath, ['scripts/serve-spa.mjs', '8100'], {
  cwd: process.cwd(),
  stdio: 'ignore',
});

try {
  let serverReady = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:8100');
      if (response.ok) {
        serverReady = true;
        break;
      }
    } catch {
      await delay(250);
    }
  }

  if (!serverReady) {
    throw new Error('El servidor E2E no respondio en el puerto 8100.');
  }

  const command = `npx playwright test ${extraArguments}`.trim();
  const tests = spawnSync(command, {
    cwd: process.cwd(),
    env: { ...process.env, PW_NO_SERVER: '1' },
    shell: true,
    stdio: 'inherit',
  });
  process.exitCode = tests.status ?? 1;
} finally {
  server.kill();
}
