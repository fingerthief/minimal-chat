"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promptForConfigurationSelection = promptForConfigurationSelection;
exports.promptForDeviceSelection = promptForDeviceSelection;
exports.promptForSchemeSelection = promptForSchemeSelection;
function _chalk() {
  const data = _interopRequireDefault(require("chalk"));
  _chalk = function () {
    return data;
  };
  return data;
}
function _prompts() {
  const data = _interopRequireDefault(require("prompts"));
  _prompts = function () {
    return data;
  };
  return data;
}
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function promptForSchemeSelection(project) {
  const {
    scheme
  } = await (0, _prompts().default)({
    name: 'scheme',
    type: 'select',
    message: 'Select the scheme you want to use',
    choices: project.schemes.map(value => ({
      title: value,
      value: value
    }))
  });
  return scheme;
}
async function promptForConfigurationSelection(project) {
  const {
    configuration
  } = await (0, _prompts().default)({
    name: 'configuration',
    type: 'select',
    message: 'Select the configuration you want to use',
    choices: project.configurations.map(value => ({
      title: value,
      value: value
    }))
  });
  return configuration;
}
async function promptForDeviceSelection(availableDevices) {
  const {
    device
  } = await (0, _prompts().default)({
    type: 'select',
    name: 'device',
    message: 'Select the device you want to use',
    choices: availableDevices.filter(d => d.type === 'device' || d.type === 'simulator').map(d => ({
      title: `${_chalk().default.bold(d.name)} ${!d.isAvailable && !!d.availabilityError ? _chalk().default.red(`(unavailable - ${d.availabilityError})`) : ''}`,
      value: d,
      disabled: !d.isAvailable
    })),
    min: 1
  });
  return device;
}

//# sourceMappingURL=prompts.ts.map