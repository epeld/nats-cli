module.exports = {
    'extends': 'google',
    'env': {
      'browser': true,
      'node': true
    },
    'parserOptions': {
      'ecmaVersion': 8
    },
    'rules': {
      'max-len': 'off',
      'comma-dangle': 'off',
      'object-curly-spacing': 'off',
      'arrow-parens': [2, 'as-needed', { 'requireForBlockBody': true }],
      'prefer-rest-params': 'off', // we probably want to enable this later
      'prefer-spread': 'off', // we probably want to enable this later
      'new-cap': 'off',
      'valid-jsdoc': 'off', // we should make sure this passes
      'keyword-spacing': 'error'
    }
};
