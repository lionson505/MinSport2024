// import js from '@eslint/js'
// import globals from 'globals'
// import reactHooks from 'eslint-plugin-react-hooks'
// import reactRefresh from 'eslint-plugin-react-refresh'
// import tseslint from 'typescript-eslint'
//
// export default tseslint.config(
//   { ignores: ['dist'] },
//   {
//     extends: [js.configs.recommended, ...tseslint.configs.recommended],
//     files: ['**/*.{ts,tsx}'],
//     languageOptions: {
//       ecmaVersion: 2020,
//       globals: globals.browser,
//     },
//     plugins: {
//       'react-hooks': reactHooks,
//       'react-refresh': reactRefresh,
//     },
//     rules: {
//       ...reactHooks.configs.recommended.rules,
//       'react-refresh/only-export-components': [
//         'warn',
//         { allowConstantExport: true },
//       ],
//
//     },
//   },
// )
import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['**/*.js', '**/*.ts', '**/*.tsx'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                ...globals.browser, // Includes browser globals like `window`, `document`, etc.
                ...globals.node,    // Includes Node.js globals like `process`, `Buffer`, etc.
            },
        },
        rules: {
            'no-console': 'error',         // Disallow all console statements
            'no-debugger': 'error',        // Disallow debugger statements
            'no-unused-vars': 'warn',      // Warn on unused variables
            'no-undef': 'error',           // Disallow undefined variables
            'prefer-const': 'error',       // Prefer `const` over `let` where possible
            'eqeqeq': 'error',             // Enforce strict equality
            'no-var': 'error',             // Disallow `var` in favor of `let` and `const`
            'semi': ['error', 'always'],   // Enforce semicolon usage
            'quotes': ['error', 'single'], // Enforce single quotes
        },
    },
];
