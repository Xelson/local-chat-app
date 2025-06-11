import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

const stylisticConfigRules = {
  ...stylistic.configs.customize({
    indent: 'tab',
    jsx: true,
    semi: true,
    quoteProps: 'consistent',
    quotes: 'single',
  }).rules,
  '@stylistic/indent-binary-ops': ['off'],
  '@stylistic/jsx-one-expression-per-line': ['off'],
  '@stylistic/jsx-quotes': ['error', 'prefer-single'],
  '@stylistic/multiline-ternary': ['off'],
  '@stylistic/max-len': ['error', {
    code: 150,
    ignoreComments: true,
    ignoreTemplateLiterals: true
  }],
};

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@stylistic': stylistic,
    },
    rules: {
      ...stylisticConfigRules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
