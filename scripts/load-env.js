/**
 * Load .env file into process.env (no external dependency)
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
  return;
}

fs.readFileSync(envPath, 'utf8')
  .split('\n')
  .forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
