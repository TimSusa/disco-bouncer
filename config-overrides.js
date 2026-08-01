module.exports = function override(config) {
  // Force webpack to prefer CJS main fields over ESM module fields
  // This fixes "Class extends value [object Module]" on Node 24
  config.resolve.mainFields = ['browser', 'main', 'module'];
  return config;
};
