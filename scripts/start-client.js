/**
 * Start frontend dev server on the configured CLIENT_PORT
 */
const { spawn } = require('child_process');
const path = require('path');
const ports = require('../config/ports');

const root = path.join(__dirname, '..');
const useServe = process.env.CLIENT_DEV_TOOL === 'serve' || !require('fs').existsSync(
  path.join(root, 'node_modules', 'live-server')
);

console.log(`\n🌐 MoMech frontend → ${ports.CLIENT_URL}\n`);

if (useServe) {
  const child = spawn('npx', ['serve', '-l', String(ports.CLIENT_PORT), '-s', '.'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });
  child.on('exit', (code) => process.exit(code ?? 0));
} else {
  const child = spawn(
    'npx',
    ['live-server', `--port=${ports.CLIENT_PORT}`, '--entry-file=index.html', '--no-browser'],
    { cwd: root, stdio: 'inherit', shell: true }
  );
  child.on('exit', (code) => process.exit(code ?? 0));
}
