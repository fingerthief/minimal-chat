"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startServerInNewWindow = startServerInNewWindow;
function _path() {
  const data = _interopRequireDefault(require("path"));
  _path = function () {
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
function _execa() {
  const data = _interopRequireDefault(require("execa"));
  _execa = function () {
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
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function startServerInNewWindow(port, terminal, projectRoot, reactNativePath) {
  /**
   * Set up OS-specific filenames and commands
   */
  const isWindows = /^win/.test(process.platform);
  const scriptFile = isWindows ? 'launchPackager.bat' : 'launchPackager.command';
  const packagerEnvFilename = isWindows ? '.packager.bat' : '.packager.env';
  const packagerEnvFileExportContent = isWindows ? `set RCT_METRO_PORT=${port}\nset PROJECT_ROOT=${projectRoot}\nset REACT_NATIVE_PATH=${reactNativePath}` : `export RCT_METRO_PORT=${port}\nexport PROJECT_ROOT=${projectRoot}\nexport REACT_NATIVE_PATH=${reactNativePath}`;
  const nodeModulesPath = (0, _cliTools().resolveNodeModuleDir)(projectRoot, '.bin');
  const cliPluginMetroPath = _path().default.join(_path().default.dirname(require.resolve('@react-native-community/cli-plugin-metro/package.json')), 'build');

  /**
   * Set up the `.packager.(env|bat)` file to ensure the packager starts on the right port and in right directory.
   */
  const packagerEnvFile = _path().default.join(nodeModulesPath, `${packagerEnvFilename}`);

  /**
   * Set up the `launchPackager.(command|bat)` file.
   * It lives next to `.packager.(bat|env)`
   */
  const launchPackagerScript = _path().default.join(nodeModulesPath, scriptFile);
  const procConfig = {
    cwd: _path().default.dirname(packagerEnvFile)
  };

  /**
   * Ensure we overwrite file by passing the `w` flag
   */
  _fs().default.writeFileSync(packagerEnvFile, packagerEnvFileExportContent, {
    encoding: 'utf8',
    flag: 'w'
  });

  /**
   * Copy files into `node_modules/.bin`.
   */

  try {
    if (isWindows) {
      _fs().default.copyFileSync(_path().default.join(cliPluginMetroPath, 'launchPackager.bat'), _path().default.join(nodeModulesPath, 'launchPackager.bat'));
    } else {
      _fs().default.copyFileSync(_path().default.join(cliPluginMetroPath, 'launchPackager.command'), _path().default.join(nodeModulesPath, 'launchPackager.command'));
    }
  } catch (error) {
    return new (_cliTools().CLIError)(`Couldn't copy the script for running bundler. Please check if the "${scriptFile}" file exists in the "node_modules/@react-native-community/cli-plugin-metro" folder and try again.`, error);
  }
  if (process.platform === 'darwin') {
    try {
      return _execa().default.sync('open', ['-a', terminal, launchPackagerScript], procConfig);
    } catch (error) {
      return _execa().default.sync('open', [launchPackagerScript], procConfig);
    }
  }
  if (process.platform === 'linux') {
    try {
      return _execa().default.sync(terminal, ['-e', `sh ${launchPackagerScript}`], {
        ...procConfig,
        detached: true
      });
    } catch (error) {
      // By default, the child shell process will be attached to the parent
      return _execa().default.sync('sh', [launchPackagerScript], procConfig);
    }
  }
  if (isWindows) {
    // Awaiting this causes the CLI to hang indefinitely, so this must execute without await.
    return (0, _execa().default)('cmd.exe', ['/C', launchPackagerScript], {
      ...procConfig,
      detached: true,
      stdio: 'ignore'
    });
  }
  _cliTools().logger.error(`Cannot start the packager. Unknown platform ${process.platform}`);
  return;
}

//# sourceMappingURL=startServerInNewWindow.ts.map