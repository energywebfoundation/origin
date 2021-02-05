const path = require('path');

module.exports = {
    extends: ['../../../.eslintrc.js'],
    parserOptions: {
        project: './tsconfig.json'
    },
    rules: {
        'import/no-extraneous-dependencies': [
            'error',
            {
                packageDir: [__dirname, path.join(__dirname, '../../../')]
            }
        ],
        camelcase: 'off'
    }
};
