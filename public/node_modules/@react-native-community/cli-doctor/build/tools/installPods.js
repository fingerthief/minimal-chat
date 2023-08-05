"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.installCocoaPods = installCocoaPods;
exports.runSudo = runSudo;
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
function _chalk() {
  const data = _interopRequireDefault(require("chalk"));
  _chalk = function () {
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
function _sudoPrompt() {
  const data = _interopRequireDefault(require("sudo-prompt"));
  _sudoPrompt = function () {
    return data;
  };
  return data;
}
var _runBundleInstall = _interopRequireDefault(require("./runBundleInstall"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function runPodInstall(loader, directory, shouldHandleRepoUpdate = true) {
  try {
    loader.start(`Installing CocoaPods dependencies ${_chalk().default.dim('(this may take a few minutes)')}`);
    await (0, _execa().default)('bundle', ['exec', 'pod', 'install']);
  } catch (error) {
    // "pod" command outputs errors to stdout (at least some of them)
    const stderr = error.stderr || error.stdout;

    /**
     * If CocoaPods failed due to repo being out of date, it will
     * include the update command in the error message.
     *
     * `shouldHandleRepoUpdate` will be set to `false` to
     * prevent infinite loop (unlikely scenario)
     */
    if (stderr.includes('pod repo update') && shouldHandleRepoUpdate) {
      await runPodUpdate(loader);
      await runPodInstall(loader, directory, false);
    } else {
      loader.fail();
      _cliTools().logger.error(stderr);
      throw new (_cliTools().CLIError)(`Looks like your iOS environment is not properly set. Please go to ${_cliTools().link.docs('environment-setup')} and follow the React Native CLI QuickStart guide for macOS and iOS.`);
    }
  }
}
async function runPodUpdate(loader) {
  try {
    loader.start(`Updating CocoaPods repositories ${_chalk().default.dim('(this may take a few minutes)')}`);
    await (0, _execa().default)('pod', ['repo', 'update']);
  } catch (error) {
    // "pod" command outputs errors to stdout (at least some of them)
    _cliTools().logger.log(error.stderr || error.stdout);
    loader.fail();
    throw new (_cliTools().CLIError)(`Failed to update CocoaPods repositories for iOS project.\nPlease try again manually: "pod repo update".\nCocoaPods documentation: ${_chalk().default.dim.underline('https://cocoapods.org/')}`);
  }
}
function runSudo(command) {
  return new Promise((resolve, reject) => {
    _sudoPrompt().default.exec(command, {
      name: 'React Native CLI'
    }, error => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}
async function installCocoaPodsWithGem() {
  const options = ['install', 'cocoapods', '--no-document'];
  try {
    // First attempt to install `cocoapods`
    await (0, _execa().default)('gem', options);
  } catch (_error) {
    // If that doesn't work then try with sudo
    await runSudo(`gem ${options.join(' ')}`);
  }
}
async function installCocoaPods(loader) {
  loader.stop();
  loader.start('Installing CocoaPods');
  try {
    await installCocoaPodsWithGem();
    return loader.succeed();
  } catch (error) {
    loader.fail();
    _cliTools().logger.error(error.stderr);
    throw new (_cliTools().CLIError)(`An error occured while trying to install CocoaPods, which is required by this template.\nPlease try again manually: sudo gem install cocoapods.\nCocoaPods documentation: ${_chalk().default.dim.underline('https://cocoapods.org/')}`);
  }
}
async function installPods({
  directory,
  loader
}) {
  loader = loader || new (_cliTools().NoopLoader)();
  try {
    if (!_fs().default.existsSync('ios')) {
      return;
    }
    process.chdir('ios');
    const hasPods = _fs().default.existsSync('Podfile');
    if (!hasPods) {
      return;
    }
    if (_fs().default.existsSync('../Gemfile')) {
      await (0, _runBundleInstall.default)(loader);
    }
    try {
      // Check if "pod" is available and usable. It happens that there are
      // multiple versions of "pod" command and even though it's there, it exits
      // with a failure
      await (0, _execa().default)('pod', ['--version']);
    } catch (e) {
      loader.info();
      await installCocoaPods(loader);
    }
    await runPodInstall(loader, directory);
  } finally {
    process.chdir('..');
  }
}
var _default = installPods;
exports.default = _default;

//# sourceMappingURL=installPods.ts.map