import fs from 'fs';
import path from 'path';
import * as utils from './utils';

const builtin = path.resolve(__dirname, './tasks');

function filterTasks(file) {
	return /[\\/]?([^_][^\\/]*)\.js$/.test(file);
}

function loaddir(dir, filter) {
	const fns = [];
	let files;
	try {
		files = fs.readdirSync(dir);
	} catch (e) {
		utils.exit(`Unable to read dir:\n${dir}`);
	}
	files.forEach(function push(file) {
		if (filter(file)) {
			const filepath = path.resolve(dir, file);
			let fn;
			try {
				/* eslint-disable global-require, import/no-dynamic-require */
				fn = require(filepath);
				/* eslint-enable global-require, import/no-dynamic-require */
			} catch (e) {
				utils.exit(`Unable to require file:\n${filepath}`);
			}
			let method;
			if (typeof fn === 'function') {
				method = fn;
			} else if (typeof fn.default === 'function') {
				method = fn.default;
			}
			if (!method) {
				utils.exit(`Task js files should export a function. Check:\n${filepath}`);
			}
			fns.push(method);
		}
	});
	return fns;
}

const dirpaths = [];
let disable = null;
let enable = null;

export function ban(list) {
	if (disable || enable) {
		utils.exit('`ban()` and `only()` can be invoked only once in total');
	}
	const container = Array.isArray(list) ? list : [list];
	disable = container.slice(0);
}

export function only(list) {
	if (disable || enable) {
		utils.exit('`ban()` and `only()` can be invoked only once in total');
	}
	const container = Array.isArray(list) ? list : [list];
	enable = container.slice(0);
}

export function include(dir) {
	let container = dir;
	if (!Array.isArray(container)) {
		if (typeof dir === 'string') {
			container = [dir];
		} else {
			utils.exit('`include()` accepts an array or a string only');
		}
	}
	container.forEach(function append(dirpath) {
		const resolve = path.resolve(dirpath);
		if (dirpaths.indexOf(resolve) < 0) {
			if (!fs.existsSync(resolve)) {
				utils.exit(`Unable to resolve path:\n${dirpath}`);
			}
			dirpaths.push(resolve);
		}
	});
}

export function load(gulp, context) {
	const fns = loaddir(builtin, function filterBuiltinTasks(file) {
		if (filterTasks(file)) {
			const basename = RegExp.$1;
			if (enable) {
				return enable.indexOf(basename) > -1;
			}
			if (disable) {
				return disable.indexOf(basename) < 0;
			}
			return true;
		}
		return false;
	});
	dirpaths.forEach(function filterIncludedTasks(dir) {
		const tasks = loaddir(dir, filterTasks);
		fns.push(...tasks);
	});
	fns.forEach(fn => fn.call(context, gulp));
}

export function create(gulp, { commands }) {
	const stages = ['dev', 'build'];
	const names = commands.filter(task => stages.indexOf(task) > -1);
	if (!names.length) {
		return;
	}
	if (names.length > 1) {
		utils.exit('Unable to run different stages in the same time');
	}

	const stage = names.shift();
	const tree = {
		before: [],
		normal: [],
		after: []
	};

	const re = new RegExp(`^(default|${stage}):((before|after):)?([\\s\\S]+)$`);
	gulp.tree().nodes.forEach(function push(task) {
		if (re.test(task)) {
			const type = RegExp.$3 || 'normal';
			tree[type].push(task);
		}
	});

	const args = [];
	const append = function append(arr) {
		if (arr.length) {
			args.push(gulp.parallel(...arr));
		}
	};
	append(tree.before);
	append(tree.normal);
	append(tree.after);
	if (args.length) {
		gulp.task(stage, gulp.series(...args));
	}
}