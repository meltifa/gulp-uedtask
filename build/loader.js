'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ban = ban;
exports.only = only;
exports.include = include;
exports.load = load;
exports.create = create;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const builtin = _path2.default.resolve(__dirname, './tasks');

function filterTasks(file) {
	return (/[\\/]?([^_][^\\/]*)\.js$/.test(file)
	);
}

function loaddir(dir, filter) {
	const fns = [];
	let files;
	try {
		files = _fs2.default.readdirSync(dir);
	} catch (e) {
		utils.exit(`Unable to read dir:\n${dir}`);
	}
	files.forEach(function push(file) {
		if (filter(file)) {
			const filepath = _path2.default.resolve(dir, file);
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

function ban(list) {
	if (disable || enable) {
		utils.exit('`ban()` and `only()` can be invoked only once in total');
	}
	const container = Array.isArray(list) ? list : [list];
	disable = container.slice(0);
}

function only(list) {
	if (disable || enable) {
		utils.exit('`ban()` and `only()` can be invoked only once in total');
	}
	const container = Array.isArray(list) ? list : [list];
	enable = container.slice(0);
}

function include(dir) {
	let container = dir;
	if (!Array.isArray(container)) {
		if (typeof dir === 'string') {
			container = [dir];
		} else {
			utils.exit('`include()` accepts an array or a string only');
		}
	}
	container.forEach(function append(dirpath) {
		const resolve = _path2.default.resolve(dirpath);
		if (dirpaths.indexOf(resolve) < 0) {
			if (!_fs2.default.existsSync(resolve)) {
				utils.exit(`Unable to resolve path:\n${dirpath}`);
			}
			dirpaths.push(resolve);
		}
	});
}

function load(gulp, context) {
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

function create(gulp, { commands }) {
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