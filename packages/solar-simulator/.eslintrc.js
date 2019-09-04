const path = require('path');

module.exports = {
    "extends": [
        "../../.eslintrc.js"
    ],
    "parserOptions": {
        "project": './tsconfig.build.json'
    },
    "rules": {
        "import/no-extraneous-dependencies": ["error", {
            "packageDir": [__dirname, path.join(__dirname, '../../')]
        }],
        "@typescript-eslint/camelcase": "off"
    }
};