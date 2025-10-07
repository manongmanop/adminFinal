#!/usr/bin/env node
import { createRequire } from 'module';
import { spawn } from 'child_process';
import path from 'path';

const require = createRequire(import.meta.url);
const viteArgs = process.argv.slice(2);

const forwardExit = (child) => {
  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });

  child.on('error', (error) => {
    console.error('[admin] Failed to start Vite:', error.message);
    process.exit(1);
  });
};

try {
  const vitePackageJsonPath = require.resolve('vite/package.json');
  const { bin } = require('vite/package.json');
  const viteBinRelative = typeof bin === 'string' ? bin : bin?.vite;

  if (!viteBinRelative) {
    throw new Error('Unable to locate the Vite binary from package.json.');
  }

  const viteBin = path.join(path.dirname(vitePackageJsonPath), viteBinRelative);
  const child = spawn(process.execPath, [viteBin, ...viteArgs], {
    stdio: 'inherit',
  });
  forwardExit(child);
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') {
    throw error;
  }

  console.warn('[admin] Local Vite installation not found. Falling back to `npx vite`.');
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(command, ['--yes', 'vite', ...viteArgs], {
    stdio: 'inherit',
    shell: false,
  });
  forwardExit(child);
}
