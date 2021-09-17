const nrwlConfig = require('@nrwl/react/plugins/webpack');

module.exports = (config, context) => {
  nrwlConfig(config);
  return {
    ...config,
    node: { global: true, fs: 'empty' },
  };
};
