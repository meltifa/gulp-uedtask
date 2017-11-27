'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.mkdirSync = mkdirSync;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mkdirSync(directory, mode) {
	const dirpath = _path2.default.resolve(process.cwd(), directory);
	const F_OK = _fs2.default.hasOwnProperty('F_OK') ? _fs2.default.F_OK : _fs2.default.constants.F_OK;
	const deep = function (dir, cb) {
		try {
			_fs2.default.accessSync(dir, F_OK);
		} catch (e) {
			deep(_path2.default.dirname(dir), function () {
				return _fs2.default.mkdirSync(dir, mode);
			});
		}
		if ('function' === typeof cb) {
			cb();
		}
	};
	return deep(dirpath);
}