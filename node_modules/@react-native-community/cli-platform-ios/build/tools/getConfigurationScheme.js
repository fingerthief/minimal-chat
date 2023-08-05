"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfigurationScheme = getConfigurationScheme;
var _getBuildConfigurationFromXcScheme = require("./getBuildConfigurationFromXcScheme");
function getConfigurationScheme({
  scheme,
  mode
}, sourceDir) {
  if (scheme && mode) {
    return mode;
  }
  const configuration = mode || 'Debug';
  if (scheme) {
    return (0, _getBuildConfigurationFromXcScheme.getBuildConfigurationFromXcScheme)(scheme, configuration, sourceDir);
  }
  return configuration;
}

//# sourceMappingURL=getConfigurationScheme.ts.map