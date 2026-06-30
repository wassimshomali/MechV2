module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    feather: 'readonly',
    AOS: 'readonly',
    replaceFeatherIcons: 'readonly',
    showLoading: 'readonly',
    hideLoading: 'readonly',
    showNotification: 'readonly',
  },
  overrides: [
    {
      files: ['config/api.js', 'src/**/*.js'],
      env: { browser: true, node: true },
      parserOptions: { sourceType: 'module' },
    },
    {
      files: ['server/**/*.js', 'config/app.js', 'config/colors.js', 'tests/**/*.js'],
      env: { node: true, browser: false },
      parserOptions: { sourceType: 'commonjs' },
    },
  ],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': 'off',
    'no-useless-escape': 'off',
    'no-prototype-builtins': 'off',
    'no-case-declarations': 'off',
    'no-undef': 'error',
  },
};
