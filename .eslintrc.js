module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'always',
      },
    ],
    'max-len': ['error', { code: 150 }],
    'no-console': 0,
    'consistent-return': 0,
    'no-param-reassign': 0,
  },
};
