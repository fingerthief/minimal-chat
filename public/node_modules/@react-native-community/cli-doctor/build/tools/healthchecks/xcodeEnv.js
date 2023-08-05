"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _cliPlatformIos() {
  const data = require("@react-native-community/cli-platform-ios");
  _cliPlatformIos = function () {
    return data;
  };
  return data;
}
function _cliTools() {
  const data = require("@react-native-community/cli-tools");
  _cliTools = function () {
    return data;
  };
  return data;
}
function _fs() {
  const data = _interopRequireDefault(require("fs"));
  _fs = function () {
    return data;
  };
  return data;
}
function _path() {
  const data = _interopRequireDefault(require("path"));
  _path = function () {
    return data;
  };
  return data;
}
function _util() {
  const data = require("util");
  _util = function () {
    return data;
  };
  return data;
}
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const xcodeEnvFile = '.xcode.env';
const pathSeparator = '/';
function removeLastPathComponent(pathString) {
  return _path().default.dirname(pathString);
}
function pathHasXcodeEnvFile(pathString) {
  const xcodeEnvPath = pathString + pathSeparator + xcodeEnvFile;
  return _fs().default.existsSync(xcodeEnvPath);
}
function pathDoesNotHaveXcodeEnvFile(pathString) {
  return !pathHasXcodeEnvFile(pathString);
}
var _default = {
  label: '.xcode.env',
  description: 'File to customize Xcode environment',
  getDiagnostics: async (_, config) => {
    try {
      const projectRoot = (config === null || config === void 0 ? void 0 : config.root) ?? (0, _cliTools().findProjectRoot)();
      const missingXcodeEnvFile = (0, _cliPlatformIos().findPodfilePaths)(projectRoot).some(p => {
        const basePath = _path().default.dirname(p);
        return !pathHasXcodeEnvFile(basePath);
      });
      return {
        needsToBeFixed: missingXcodeEnvFile
      };
    } catch (e) {
      return {
        needsToBeFixed: e.message
      };
    }
  },
  runAutomaticFix: async ({
    loader,
    config
  }) => {
    try {
      loader.stop();
      const templateXcodeEnv = '_xcode.env';
      const projectRoot = (config === null || config === void 0 ? void 0 : config.root) ?? (0, _cliTools().findProjectRoot)();
      const templateIosPath = (0, _cliTools().resolveNodeModuleDir)(projectRoot, 'react-native/template/ios');
      const src = templateIosPath + pathSeparator + templateXcodeEnv;
      const copyFileAsync = (0, _util().promisify)(_fs().default.copyFile);
      (0, _cliPlatformIos().findPodfilePaths)(projectRoot).map(removeLastPathComponent)
      // avoid overriding existing .xcode.env
      .filter(pathDoesNotHaveXcodeEnvFile).forEach(async pathString => {
        const destFilePath = pathString + pathSeparator + xcodeEnvFile;
        await copyFileAsync(src, destFilePath);
      });
      loader.succeed('.xcode.env file have been created!');
    } catch (e) {
      loader.fail(e);
    }
  }
};
exports.default = _default;

//# sourceMappingURL=xcodeEnv.ts.map