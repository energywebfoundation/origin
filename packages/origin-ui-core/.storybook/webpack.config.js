module.exports = ({ config }) => {
    config.resolve.alias = {
      'popper.js$': 'popper.js/dist/esm/popper.js',
      ...config.resolve.alias
    };
    config.node = {
      fs: 'empty',
      ...config.node
    };
    return config;
  };