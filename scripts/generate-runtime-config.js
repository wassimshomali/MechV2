/**
 * Generates browser runtime config from config/ports.js
 * Run: node scripts/generate-runtime-config.js
 */
const fs = require('fs');
const path = require('path');
const ports = require('../config/ports');

const outputPath = path.join(__dirname, '../src/config/runtime.js');

const content = `/**
 * Auto-generated runtime config — do not edit manually.
 * Source: config/ports.js
 * Regenerate: npm run config:generate
 */
export const RUNTIME = {
  API_BASE: '${ports.API_BASE}',
  CLIENT_URL: '${ports.CLIENT_URL}',
  SERVER_URL: '${ports.SERVER_URL}',
};
`;

fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated ${outputPath}`);
console.log(`  Frontend: ${ports.CLIENT_URL}`);
console.log(`  API:      ${ports.API_BASE}`);
