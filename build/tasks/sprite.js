'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = sprite;

var _gm = require('gm');

var _gm2 = _interopRequireDefault(_gm);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sprite(gulp) {
	const { config: { useRetina }, emit } = this;
	if (!useRetina) {
		return;
	}

	function end(resolve, reject) {
		return function callback(err, data) {
			return err ? reject(err) : resolve(data);
		};
	}

	async function resize(filepath) {
		const file = _path2.default.resolve(filepath);
		let handler = (0, _gm2.default)(file);
		const { width, height } = await new Promise((succ, fail) => handler.size(end(succ, fail)));
		const wr = width % 2;
		const hr = height % 2;
		if (wr || hr) {
			handler = handler.borderColor('transparent').border(1, 1).crop(width + wr, height + hr, 1, 1);
			await new Promise((succ, fail) => handler.write(file, end(succ, fail)));
			const name = (0, _utils.slash)(_path2.default.relative(_path2.default.resolve('src/asset/sprite'), file).replace(/\.png$/, ''));
			emit('log', `Resized sprite asset: ${name}`);
		}
	}

	gulp.task('dev:after:sprite:resize', function watch(cb) {
		const watcher = gulp.watch('src/asset/sprite/**/*.png');
		watcher.on('add', resize);
		watcher.on('change', resize);
		return cb();
	});
}