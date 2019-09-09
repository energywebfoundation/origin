const path = require('path');

module.exports = {
    "extends": [
        "../../.eslintrc.js"
    ],
    "parserOptions": {
        "project": './tsconfig.build.json'
    },
    "rules": {
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "import/no-extraneous-dependencies": ["error", {
            "packageDir": [__dirname, path.join(__dirname, '../../')]
        }],
    }
};