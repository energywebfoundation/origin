// eslint-disable-next-line @typescript-eslint/no-var-requires
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
        'no-useless-constructor': 'off'
    }
};
