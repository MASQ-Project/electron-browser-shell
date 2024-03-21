module.exports = {
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['react'],
    extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
    env: {
        browser: true,
        node: true,
        es2022: true,
    },
    rules: {
        'no-unused-vars': [
            'warn',
            { vars: 'all', args: 'none', ignoreRestSiblings: false },
        ],
        'no-dupe-keys': 'warn',
        'no-shadow': 'warn',
        'react/prop-types': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};
