import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import typescriptConfig from './eslint/typescript-config.js'
import reactConfig from './eslint/react-config.js'
import stylisticConfig from './eslint/stylistic-config.js'
import unusedImports from 'eslint-plugin-unused-imports'
import perfectionist from 'eslint-plugin-perfectionist'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      ...typescriptConfig,
      ...reactConfig,
      ...stylisticConfig
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
      perfectionist,
      'no-relative-import-paths': noRelativeImportPaths,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          'vars': 'all',
          'varsIgnorePattern': '^_',
          'args': 'after-used',
          'argsIgnorePattern': '^_',
        },
      ],
      'perfectionist/sort-imports': 'error',
      'perfectionist/sort-named-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          fallbackSort: { type: 'unsorted' },
          ignoreAlias: false,
          ignoreCase: true,
          specialCharacters: 'keep',
          groupKind: 'mixed',
          partitionByNewLine: false,
          partitionByComment: false,
        },
      ],
      'no-relative-import-paths/no-relative-import-paths': [
        'error',
        {
          "prefix": "@",
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts}'],
    rules: {
      // 1つの関数の行数を50以下に制限
      'max-lines-per-function': ['error', { max: 50 }],
    },
  },
)
