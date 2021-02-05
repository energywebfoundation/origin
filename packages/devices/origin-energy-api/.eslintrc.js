const path = require('path');

module.exports = {
    extends: ['../../../.eslintrc.js'],
    rules: {
        'import/no-extraneous-dependencies': [
            'error',
            {
                packageDir: [__dirname, path.join(__dirname, '../../../')]
            }
        ],
        'no-useless-constructor': 'off',
        'no-empty': 'off'
    },
    plugins: ['jest'],
    env: {
        'jest/globals': true
    }
};
