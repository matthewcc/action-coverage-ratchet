module.exports = {
    env: {
        node: true,
        es6: true,
        jest: true,
        jquery: false
    },
    extends: [
        'plugin:jest/recommended',
        'plugin:json/recommended',
        'airbnb-base',
        './.eslint-base'
    ],
    globals: {
        globalThis: false
    },
    parserOptions: {
        ecmaVersion: 2020
    },
    plugins: [
        '@typescript-eslint'
    ],
    // typescript stuff that needs to be separate
    overrides: [
        {
            files: ['**/*.ts?(x)'],
            excludedFiles: 'node_modules',
            extends: [
                'airbnb-typescript/base',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                './.eslint-base'
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: [
                    './tsconfig.eslint.json'
                ]
            },
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/indent': [
                    'error',
                    4
                ],
                'comma-dangle': 'off',
                '@typescript-eslint/comma-dangle': [
                    'error',
                    'never'
                ],
                'no-shadow': 'off',
                '@typescript-eslint/no-shadow': 'error',
                'brace-style': 'off',
                '@typescript-eslint/brace-style': [
                    'error',
                    'stroustrup'
                ]
            }
        }
    ]
};
