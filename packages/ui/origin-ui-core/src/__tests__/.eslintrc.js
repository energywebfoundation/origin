module.exports = {
    extends: '../../../../../.eslintrc.js',
    rules: {
        camelcase: 'off',
        'max-classes-per-file': 'off',
        'guard-for-in': 'off'
    },
    env: {
        jest: true
    }
};
