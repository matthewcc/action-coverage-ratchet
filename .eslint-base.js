module.exports = {
    rules: {
        indent: [
            2,
            4,
            {
                SwitchCase: 1
            }
        ],
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    '**/*.test.*'
                ]
            }
        ],
        'import/no-unresolved': 1,
        'import/extensions': [
            2,
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                mjs: 'never',
                ts: 'never',
                tsx: 'never'
            }
        ],
        'linebreak-style': [
            2,
            'unix'
        ],
        semi: [
            2,
            'always'
        ],
        'no-console': [
            1,
            {
                allow: [
                    'warn',
                    'error'
                ]
            }
        ],
        'space-before-function-paren': 0,
        'no-tabs': 0,
        'func-names': 0,
        'brace-style': [
            2,
            'stroustrup'
        ],
        'no-mixed-spaces-and-tabs': 2,
        'multiline-comment-style': [
            1,
            'bare-block'
        ],
        'max-params': 1,
        strict: 0,
        quotes: [
            2,
            'single'
        ],
        'padded-blocks': [
            1,
            'never'
        ],
        'no-param-reassign': 1,
        'no-plusplus': [
            2,
            {
                allowForLoopAfterthoughts: true
            }
        ],
        'max-len': [
            'warn',
            {
                code: 120,
                ignoreStrings: true
            }
        ],
        'comma-dangle': [
            2,
            'never'
        ],
        'arrow-parens': [
            2,
            'as-needed'
        ]
    }
}
