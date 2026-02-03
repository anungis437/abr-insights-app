import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import hooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'coverage/**',
      'dist/**',
      'scripts/**',
      'public/sw.js',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      '**/*.mjs',
      'check-*.mjs',
      'setup-*.mjs',
      'apply-*.mjs',
      'assign-*.mjs',
      'create-*.mjs',
      'fix-*.mjs',
      'sync-*.mjs',
      'test-*.mjs',
      'verify-*.mjs',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
    plugins: {
      'react-hooks': hooksPlugin,
      '@next/next': nextPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      // Turn off all warnings - keep only errors
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Turn off jsx-a11y warnings (accessibility should be addressed separately)
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
    },
  }
)
