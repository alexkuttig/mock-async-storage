'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.release = exports.mock = undefined;

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}

function _asyncToGenerator(fn) {
    return function () {
        var gen = fn.apply(this, arguments);
        return new Promise(function (resolve, reject) {
            function step(key, arg) {
                try {
                    var info = gen[key](arg);
                    var value = info.value;
                } catch (error) {
                    reject(error);
                    return;
                }
                if (info.done) {
                    resolve(value);
                } else {
                    return Promise.resolve(value).then(function (value) {
                        step("next", value);
                    }, function (err) {
                        step("throw", err);
                    });
                }
            }

            return step("next");
        });
    };
}

/* global jest Iterable */

const isStringified = str => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

class AsyncDict {

    size() {
        return this.store.size;
    }

    getStore() {
        return new Map(this.store);
    }

    constructor() {
        this.store = new Map();
    }

    getItem(k, cb) {
        var _this = this;

        return _asyncToGenerator(function*() {
            var val = _this.store.get(k);
            if (typeof val === 'undefined') val = null;
            if (cb) cb(null, val);
            return val;
        })();
    }

    setItem(k, v, cb) {
        var _this2 = this;

        return _asyncToGenerator(function*() {
            _this2.store.set(k, v);
            if (cb) cb(null);
        })();
    }

    removeItem(k, cb) {
        var _this3 = this;

        return _asyncToGenerator(function*() {
            _this3.store.delete(k);
            if (cb) cb(null);
        })();
    }

    clear(cb) {
        var _this4 = this;

        return _asyncToGenerator(function*() {
            _this4.store.clear();
            if (cb) cb(null);
        })();
    }

    getAllKeys(cb) {
        var _this5 = this;

        return _asyncToGenerator(function*() {
            const keys = Array.from(_this5.store.keys());
            if (cb) cb(null, keys);
            return keys;
        })();
    }

    multiGet(keys, cb) {
        var _this6 = this;

        return _asyncToGenerator(function*() {
            const entries = Array.from(_this6.store.entries());
            const requested = entries.filter(function ([k]) {
                return keys.includes(k);
            });
            if (cb) cb(null, requested);
            return requested;
        })();
    }

    multiSet(entries, cb) {
        var _this7 = this;

        return _asyncToGenerator(function*() {
            for (const [key, value] of entries) {
                _this7.store.set(key, value);
            }
            if (cb) cb(null);
        })();
    }

    multiRemove(keys, cb) {
        var _this8 = this;

        return _asyncToGenerator(function*() {
            for (const key of keys) {
                _this8.store.delete(key);
            }
            if (cb) cb(null);
        })();
    }
}

class AsyncStorageMock extends AsyncDict {
    mergeItem(key, value, cb) {
        var _this9 = this;

        return _asyncToGenerator(function*() {
            const item = yield _this9.getItem(key);

            if (!item) throw new Error(`No item with ${ key } key`);
            if (!isStringified(item)) throw new Error(`Invalid item with ${ key } key`);
            if (!isStringified(value)) throw new Error(`Invalid value to merge with ${ key }`);

            const itemObj = JSON.parse(item);
            const valueObj = JSON.parse(value);
            const merged = (0, _deepmerge2.default)(itemObj, valueObj);

            yield _this9.setItem(key, JSON.stringify(merged));

            if (cb) cb(null);
        })();
    }

    multiMerge(entries, cb) {
        var _this10 = this;

        return _asyncToGenerator(function*() {
            const errors = [];
            /* eslint no-restricted-syntax: "off" */
            /* eslint no-await-in-loop: "off" */
            for (const [key, value] of entries) {
                try {
                    yield _this10.mergeItem(key, value);
                } catch (err) {
                    errors.push(err);
                }
            }

            if (errors.length) {
                if (cb) cb(errors);
                return Promise.reject(errors);
            }

            if (cb) cb(null);
            return Promise.resolve();
        })();
    }
}

const mock = exports.mock = () => {
    const mockImpl = new AsyncStorageMock();
    jest.mock('AsyncStorage', () => mockImpl);
};

const release = exports.release = () => jest.unmock('AsyncStorage');

exports.default = AsyncStorageMock;