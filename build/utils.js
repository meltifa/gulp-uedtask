'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.exit = exit;
exports.throttle = throttle;
exports.slash = slash;
function exit(message) {
	/* eslint-disable no-console */
	console.warn('\x1B[31m' + message + '\x1B[0m');
	/* eslint-enable no-console */
	process.exit();
}

function throttle(fn) {
	var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;
	var doDelay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

	var timer = null;
	var beginTime = void 0;
	return function func() {
		var _this = this;

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		var currentTime = Number(new Date());
		clearTimeout(timer);
		if (!beginTime) {
			beginTime = currentTime;
		}
		if (doDelay && currentTime - beginTime >= doDelay) {
			fn.apply(this, args);
			beginTime = currentTime;
		} else {
			timer = setTimeout(function () {
				return fn.apply(_this, args);
			}, delay);
		}
	};
}

function slash(str) {
	return str.replace(/\\/g, '/');
}