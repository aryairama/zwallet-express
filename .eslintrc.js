module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'linebreak-style': 0,
    'max-len': ['error', { code: 150 }],
    'no-console': 0,
    'consistent-return': 0,
    'no-param-reassign': 0,
  },
};
