'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.exit = exit;
exports.throttle = throttle;
exports.slash = slash;
function exit(message) {
	/* eslint-disable no-console */
	console.warn(`\x1b[31m${message}\x1b[0m`);
	/* eslint-enable no-console */
	process.exit();
}

function throttle(fn, delay = 200, doDelay = 0) {
	let timer = null;
	let beginTime;
	return function func(...args) {
		const currentTime = Number(new Date());
		clearTimeout(timer);
		if (!beginTime) {
			beginTime = currentTime;
		}
		if (doDelay && currentTime - beginTime >= doDelay) {
			fn.apply(this, args);
			beginTime = currentTime;
		} else {
			timer = setTimeout(() => fn.apply(this, args), delay);
		}
	};
}

function slash(str) {
	return str.replace(/\\/g, '/');
}