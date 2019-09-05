module.exports = {
    "extends": [
        "airbnb-base",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "project": './tsconfig.build.json'
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "array-callback-return": "off",
        "@typescript-eslint/interface-name-prefix": ["error", {
            "prefixWithI": "always"
        }],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "func-names": "off",
        "consistent-return": "off",
        "class-methods-use-this": "off",
        "default-case": "off",
        "import/prefer-default-export": "off",
        "no-await-in-loop": "off",
        "no-case-declarations": "off",
        "no-console": "off",
        "no-else-return": "off",
        "react/jsx-no-target-blank": "off",
        "no-continue": "off",
        "no-nested-ternary": "off",
        "no-param-reassign": "off",
        "no-plusplus": "off",
        "no-restricted-globals": "off",
        "no-underscore-dangle": "off",
        "no-restricted-syntax": "off",
        "import/order": "off",
        "prefer-destructuring": "off",
        "prefer-template": "off"
    },
    "settings": {
        "import/resolver": {
          "node": {
            "extensions": [".js", ".jsx", ".ts", ".tsx", ".d.ts"]
          }
        },
        "react": {
            "pragma": "React",
            "version": "detect"
        }
    }
};