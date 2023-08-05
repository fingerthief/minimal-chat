import AsyncStorage from './AsyncStorage';
export function useAsyncStorage(key) {
  return {
    getItem: function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return AsyncStorage.getItem(key, ...args);
    },
    setItem: function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return AsyncStorage.setItem(key, ...args);
    },
    mergeItem: function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      return AsyncStorage.mergeItem(key, ...args);
    },
    removeItem: function () {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      return AsyncStorage.removeItem(key, ...args);
    }
  };
}
//# sourceMappingURL=hooks.js.map