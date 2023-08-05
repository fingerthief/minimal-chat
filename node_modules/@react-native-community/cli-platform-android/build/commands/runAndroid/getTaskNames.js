"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTaskNames = getTaskNames;
var _toPascalCase = require("./toPascalCase");
var _listAndroidTasks = require("./listAndroidTasks");
function _cliTools() {
  const data = require("@react-native-community/cli-tools");
  _cliTools = function () {
    return data;
  };
  return data;
}
function getTaskNames(appName, mode = 'debug', tasks, taskPrefix, sourceDir) {
  let appTasks = tasks && tasks.length ? tasks : [taskPrefix + (0, _toPascalCase.toPascalCase)(mode)];

  // Check against build flavors for "install" task ("assemble" don't care about it so much and will build all)
  if (!(tasks === null || tasks === void 0 ? void 0 : tasks.length) && taskPrefix === 'install') {
    const actionableInstallTasks = (0, _listAndroidTasks.getGradleTasks)('install', sourceDir);
    if (!actionableInstallTasks.find(t => t.task.includes(appTasks[0]))) {
      const installTasksForMode = actionableInstallTasks.filter(t => t.task.toLowerCase().includes(mode));
      if (!installTasksForMode.length) {
        throw new (_cliTools().CLIError)(`Couldn't find "${appTasks.map(taskName => taskName.replace(taskPrefix, '')).join(', ')}" build variant. Available variants are: ${actionableInstallTasks.map(t => `"${t.task.replace(taskPrefix, '')}"`).join(', ')}.`);
      }
      _cliTools().logger.warn(`Found multiple tasks for "install" command: ${installTasksForMode.map(t => t.task).join(', ')}.\nSelecting first available: ${installTasksForMode[0].task}.`);
      appTasks = [installTasksForMode[0].task];
    }
  }
  return appName ? appTasks.map(command => `${appName}:${command}`) : appTasks;
}

//# sourceMappingURL=getTaskNames.ts.map