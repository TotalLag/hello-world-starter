import globals from 'globals';
import tseslint from 'typescript-eslint';
import nextEslintConfig from 'eslint-config-next';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      '.turbo/',
      'dist/',
      'build/',
      '*.lock',
      '**/coverage/',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
  },
  ...nextEslintConfig,
  {
    plugins: {
      '@tanstack/query': tanstackQueryPlugin,
    },
    rules: tanstackQueryPlugin.configs.recommended.rules,
  },
  eslintPluginPrettierRecommended,
  {
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  }
);