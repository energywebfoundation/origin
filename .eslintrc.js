module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        mocha: true
    },
    extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended'
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint'],
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'interface',
                format: ['PascalCase'],
                prefix: ['I']
            }
        ],
        '@typescript-eslint/no-unused-vars': 'error',
        'no-await-in-loop': 'off',
        'no-plusplus': 'off',
        'no-console': 'off',
        'no-continue': 'off',
        'import/prefer-default-export': 'off',
        'no-restricted-syntax': 'off',
        'no-constant-condition': 'off',
        'class-methods-use-this': 'off',
        'no-underscore-dangle': 'off',
        'no-bitwise': 'off',
        'no-restricted-properties': 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never'
            }
        ],
        'no-useless-constructor': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': 'error'
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts']
            }
        }
    }
};
