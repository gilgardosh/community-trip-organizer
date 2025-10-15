import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: ['eslint.config.js', 'vitest.config.ts', 'dist/**'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  prettier,
);
