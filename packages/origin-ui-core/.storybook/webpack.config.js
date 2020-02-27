module.exports = ({ config }) => {
    config.resolve.alias = {
      'popper.js$': 'popper.js/dist/esm/popper.js',
      ...config.resolve.alias
    };
    return config;
  };