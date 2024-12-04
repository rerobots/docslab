import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: [
            'src/**/*.ts',
            'integrations/docusaurus-theme/src/**/*.{ts,tsx}',
        ],
        rules: {
            'no-trailing-spaces': 'error',
        },
    },
    {
        languageOptions: {
            globals: globals.browser,
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
