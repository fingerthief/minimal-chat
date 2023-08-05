"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.selectFromInteractiveMode = selectFromInteractiveMode;
function _cliTools() {
  const data = require("@react-native-community/cli-tools");
  _cliTools = function () {
    return data;
  };
  return data;
}
function _chalk() {
  const data = _interopRequireDefault(require("chalk"));
  _chalk = function () {
    return data;
  };
  return data;
}
var _getProjectInfo = require("./getProjectInfo");
var _prompts = require("./prompts");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function selectFromInteractiveMode({
  scheme,
  mode
}) {
  let newScheme = scheme;
  let newMode = mode;
  const project = (0, _getProjectInfo.getProjectInfo)();
  if (project.schemes.length > 1) {
    newScheme = await (0, _prompts.promptForSchemeSelection)(project);
  } else {
    _cliTools().logger.info(`Automatically selected ${_chalk().default.bold(scheme)} scheme.`);
  }
  if (project.configurations.length > 1) {
    newMode = await (0, _prompts.promptForConfigurationSelection)(project);
  } else {
    _cliTools().logger.info(`Automatically selected ${_chalk().default.bold(mode)} configuration.`);
  }
  return {
    scheme: newScheme,
    mode: newMode
  };
}

//# sourceMappingURL=selectFromInteractiveMode.ts.map