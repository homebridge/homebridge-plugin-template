import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginJest from 'eslint-plugin-jest';

export default tseslint.config(
  {
    ignores: ['dist/**'],
  },
  {
    rules: {
      quotes: ['error', 'single'],
      indent: ['error', 2, { SwitchCase: 0 }],
      'linebreak-style': ['error', 'unix'],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'dot-notation': 'error',
      eqeqeq: ['error', 'smart'],
      curly: ['error', 'all'],
      'brace-style': ['error'],
      'prefer-arrow-callback': 'warn',
      'max-len': ['warn', 160],
      'object-curly-spacing': ['error', 'always'],
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': [
        'error',
        { classes: false, enums: false },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        setTimeout: 'readable',
        clearTimeout: 'readable',
        setInterval: 'readable',
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [importPlugin.flatConfigs.recommended],
    rules: {
      'import/extensions': [
        'error',
        'always',
        {
          svg: 'never',
        },
      ],
      'import/no-unresolved': ['off'],
    },
  },
  {
    // update this to match your test files
    files: ['**/__tests__/*.test.ts'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',
      'import/extensions': 'off',
    },
  },
  eslintConfigPrettier
);
