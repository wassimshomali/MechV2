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
  // Ignore build output, logs, and backend paths — otherwise Tailwind watch and
  // request logging trigger live-server reload loops.
  const ignorePaths = ['dist', 'logs', 'database', 'node_modules', '.git', 'server'];
  const args = [
    'live-server',
    `--port=${ports.CLIENT_PORT}`,
    '--entry-file=index.html',
    '--no-browser',
    '--no-css-inject',
    ...ignorePaths.flatMap((p) => [`--ignore=${p}`]),
  ];

  const child = spawn('npx', args, { cwd: root, stdio: 'inherit', shell: true });
  child.on('exit', (code) => process.exit(code ?? 0));
}
