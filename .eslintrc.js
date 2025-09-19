/**
 * ESLint Configuration for MoMech
 * JavaScript linting rules and standards
 */

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  
  extends: [
    'eslint:recommended'
  ],
  
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  
  rules: {
    // Possible Errors
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // Best Practices
    'curly': ['error', 'all'],
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    'radix': 'error',
    
    // Stylistic Issues
    'indent': ['error', 2, { 
      SwitchCase: 1,
      VariableDeclarator: 1,
      outerIIFEBody: 1
    }],
    'quotes': ['error', 'single', { 
      avoidEscape: true,
      allowTemplateLiterals: true
    }],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'camelcase': ['error', { properties: 'never' }],
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'computed-property-spacing': ['error', 'never'],
    'func-call-spacing': ['error', 'never'],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'keyword-spacing': ['error', { before: true, after: true }],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',
    'space-unary-ops': ['error', {
      words: true,
      nonwords: false
    }],
    
    // ES6
    'arrow-spacing': ['error', { before: true, after: true }],
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'object-shorthand': ['error', 'always'],
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error'
  },
  
  globals: {
    // Browser globals
    'window': 'readonly',
    'document': 'readonly',
    'navigator': 'readonly',
    'console': 'readonly',
    'localStorage': 'readonly',
    'sessionStorage': 'readonly',
    'fetch': 'readonly',
    
    // Application globals
    'MoMechConfig': 'readonly'
  },
  
  overrides: [
    {
      files: ['server/**/*.js'],
      env: {
        node: true,
        browser: false
      },
      globals: {
        'process': 'readonly',
        'Buffer': 'readonly',
        '__dirname': 'readonly',
        '__filename': 'readonly',
        'global': 'readonly',
        'module': 'readonly',
        'require': 'readonly',
        'exports': 'readonly'
      }
    },
    {
      files: ['src/**/*.js'],
      env: {
        browser: true,
        node: false
      }
    },
    {
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      globals: {
        'describe': 'readonly',
        'it': 'readonly',
        'test': 'readonly',
        'expect': 'readonly',
        'beforeEach': 'readonly',
        'afterEach': 'readonly',
        'beforeAll': 'readonly',
        'afterAll': 'readonly',
        'jest': 'readonly'
      }
    }
  ]
};