/**
 * Generates CSS custom properties from centralized design tokens.
 * Run: node scripts/generate-tokens.js
 */
const fs = require('fs');
const path = require('path');
const { colors } = require('../config/colors');
const { motion } = require('../src/design-tokens/motion');
const { radii } = require('../src/design-tokens/radii');
const { shadows } = require('../src/design-tokens/shadows');

const outputPath = path.join(__dirname, '../src/config/tokens.css');

function flattenColors(obj, prefix = 'color') {
  let lines = [];
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      lines = lines.concat(flattenColors(value, `${prefix}-${key}`));
    } else {
      lines.push(`  --${prefix}-${key}: ${value};`);
    }
  }
  return lines;
}

function generate() {
  const colorLines = flattenColors(colors);
  const motionLines = [
    `  --duration-fast: ${motion.duration.fast};`,
    `  --duration-normal: ${motion.duration.normal};`,
    `  --duration-slow: ${motion.duration.slow};`,
    `  --ease-out: ${motion.easing.out};`,
    `  --ease-in-out: ${motion.easing.inOut};`,
    `  --ease-spring: ${motion.easing.spring};`,
  ];
  const radiusLines = Object.entries(radii).map(
    ([key, value]) => `  --radius-${key}: ${value};`
  );
  const shadowLines = Object.entries(shadows).map(
    ([key, value]) => `  --shadow-${key}: ${value};`
  );

  const css = `/**
 * Auto-generated design tokens — do not edit manually.
 * Source: config/colors.js + src/design-tokens/
 * Regenerate: npm run tokens:generate
 */

:root {
  /* Colors */
${colorLines.join('\n')}

  /* Semantic surfaces */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-muted: var(--color-gray-500);
  --color-text-inverse: #ffffff;
  --color-surface-primary: #ffffff;
  --color-surface-secondary: var(--color-gray-50);
  --color-surface-tertiary: var(--color-gray-100);
  --color-border-subtle: var(--color-gray-200);
  --color-border-default: var(--color-gray-300);
  --color-border-focus: var(--color-primary-500);

  /* Motion */
${motionLines.join('\n')}
  --transition-duration: var(--duration-normal);
  --animation-duration: var(--duration-normal);

  /* Radii */
${radiusLines.join('\n')}

  /* Shadows */
${shadowLines.join('\n')}

  /* Layout rhythm */
  --space-page: 1.5rem;
  --space-section: 1.5rem;
  --space-card: 1.5rem;
  --sidebar-width: 16rem;
  --sidebar-collapsed-width: 5rem;
}

.dark {
  --color-text-primary: var(--color-gray-100);
  --color-text-secondary: var(--color-gray-300);
  --color-text-muted: var(--color-gray-400);
  --color-text-inverse: var(--color-gray-900);
  --color-surface-primary: var(--color-gray-900);
  --color-surface-secondary: var(--color-gray-950, #0a0f1a);
  --color-surface-tertiary: var(--color-gray-800);
  --color-border-subtle: var(--color-gray-800);
  --color-border-default: var(--color-gray-700);
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --color-text-primary: var(--color-gray-100);
    --color-text-secondary: var(--color-gray-300);
    --color-text-muted: var(--color-gray-400);
    --color-surface-primary: var(--color-gray-900);
    --color-surface-secondary: #0a0f1a;
    --color-surface-tertiary: var(--color-gray-800);
    --color-border-subtle: var(--color-gray-800);
    --color-border-default: var(--color-gray-700);
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-duration: 0.01ms;
    --animation-duration: 0.01ms;
  }
}
`;

  fs.writeFileSync(outputPath, css, 'utf8');
  console.log(`Generated ${outputPath}`);
}

generate();
