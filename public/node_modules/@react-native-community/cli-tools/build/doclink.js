"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.docs = exports.contributing = exports.community = exports.blog = void 0;
exports.getOS = getOS;
exports.setPlatform = setPlatform;
exports.setVersion = setVersion;
exports.showcase = void 0;
function _os() {
  const data = _interopRequireDefault(require("os"));
  _os = function () {
    return data;
  };
  return data;
}
function _assert() {
  const data = _interopRequireDefault(require("assert"));
  _assert = function () {
    return data;
  };
  return data;
}
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function getOS() {
  // Using os.platform instead of process.platform so we can test more easily. Once jest upgrades
  // to ^29.4 we could use process.platforms and jest.replaceProperty(process, 'platforms', 'someplatform');
  switch (_os().default.platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'sunos':
      // King of controversy, right here.
      return 'linux';
    case 'darwin':
      return 'macos';
    case 'win32':
      return 'windows';
    default:
      return '';
  }
}
let _platform = 'android';
let _version;
/**
 * Create a deeplink to our documentation based on the user's OS and the Platform they're trying to build.
 */
function doclink(section, path, hashOrOverrides) {
  const url = new URL('https://reactnative.dev/');

  // Overrides
  const isObj = typeof hashOrOverrides === 'object';
  const hash = isObj ? hashOrOverrides.hash : hashOrOverrides;
  const version = isObj && hashOrOverrides.version ? hashOrOverrides.version : _version;
  const OS = isObj && hashOrOverrides.os ? hashOrOverrides.os : getOS();
  const platform = isObj && hashOrOverrides.platform ? hashOrOverrides.platform : _platform;
  url.pathname = _version ? `${section}/${version}/${path}` : `${section}/${path}`;
  url.searchParams.set('os', OS);
  url.searchParams.set('platform', platform);
  if (isObj) {
    const otherKeys = Object.keys(hashOrOverrides).filter(key => !['hash', 'version', 'os', 'platform'].includes(key));
    for (let key of otherKeys) {
      url.searchParams.set(key, hashOrOverrides[key]);
    }
  }
  if (hash) {
    _assert().default.doesNotMatch(hash, /#/, "Anchor links should be written withou a '#'");
    url.hash = hash;
  }
  return url.toString();
}
const docs = doclink.bind(null, 'docs');
exports.docs = docs;
const contributing = doclink.bind(null, 'contributing');
exports.contributing = contributing;
const community = doclink.bind(null, 'community');
exports.community = community;
const showcase = doclink.bind(null, 'showcase');
exports.showcase = showcase;
const blog = doclink.bind(null, 'blog');

/**
 * When the user builds, we should define the target platform globally.
 */
exports.blog = blog;
function setPlatform(target) {
  _platform = target;
}

/**
 * Can we figure out what version of react native they're using?
 */
function setVersion(reactNativeVersion) {
  _version = reactNativeVersion;
}

//# sourceMappingURL=doclink.ts.map