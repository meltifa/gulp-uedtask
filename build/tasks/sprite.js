'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = sprite;

var _gm = require('gm');

var _gm2 = _interopRequireDefault(_gm);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sprite(gulp) {
	var resize = function () {
		var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(filepath) {
			var file, handler, _ref2, width, height, wr, hr, name;

			return _regenerator2.default.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							file = _path2.default.resolve(filepath);
							handler = (0, _gm2.default)(file);
							_context.next = 4;
							return new _promise2.default(function (succ, fail) {
								return handler.size(end(succ, fail));
							});

						case 4:
							_ref2 = _context.sent;
							width = _ref2.width;
							height = _ref2.height;
							wr = width % 2;
							hr = height % 2;

							if (!(wr || hr)) {
								_context.next = 15;
								break;
							}

							handler = handler.borderColor('transparent').border(1, 1).crop(width + wr, height + hr, 1, 1);
							_context.next = 13;
							return new _promise2.default(function (succ, fail) {
								return handler.write(file, end(succ, fail));
							});

						case 13:
							name = (0, _utils.slash)(_path2.default.relative(_path2.default.resolve('src/asset/sprite'), file).replace(/\.png$/, ''));

							emit('log', 'Resized sprite asset: ' + name);

						case 15:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this);
		}));

		return function resize(_x) {
			return _ref.apply(this, arguments);
		};
	}();

	var useRetina = this.config.useRetina,
	    emit = this.emit;

	if (!useRetina) {
		return;
	}

	function end(resolve, reject) {
		return function callback(err, data) {
			return err ? reject(err) : resolve(data);
		};
	}

	gulp.task('dev:after:sprite:resize', function watch(cb) {
		var watcher = gulp.watch('src/asset/sprite/**/*.png');
		watcher.on('add', resize);
		watcher.on('change', resize);
		return cb();
	});
}