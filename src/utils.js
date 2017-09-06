export function exit(message) {
	/* eslint-disable no-console */
	console.warn(`\x1b[31m${message}\x1b[0m`);
	/* eslint-enable no-console */
	process.exit();
}

export function throttle(fn, delay = 200, doDelay = 0) {
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

export function slash(str) {
	return str.replace(/\\/g, '/');
}