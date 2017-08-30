'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var builtin = _path2.default.resolve(__dirname, './tasks');

function filterTasks(file) {
	return (/[\\/]?([^_][^\\/]*)\.js$/.test(file)
	);
}

function loaddir(dir, filter) {
	var fns = [];
	var files = void 0;
	try {
		files = _fs2.default.readdirSync(dir);
	} catch (e) {
		utils.exit('Unable to read dir:\n' + dir);
	}
	files.forEach(function push(file) {
		if (filter(file)) {
			var filepath = _path2.default.resolve(dir, file);
			var fn = void 0;
			try {
				/*eslint-disable*/
				fn = require(filepath);
				/*eslint-enable*/
			} catch (e) {
				utils.exit('Unable to require file:\n' + filepath);
			}
			var method = void 0;
			if (typeof fn === 'function') {
				method = fn;
			} else if (typeof fn.default === 'function') {
				method = fn.default;
			}
			if (!method) {
				utils.exit('Task js files should export a function. Check:\n' + filepath);
			}
			fns.push(method);
		}
	});
	return fns;
}

var dirpaths = [];
var disable = null;
var enable = null;

function ban(list) {
	if (disable || enable) {
		utils.exit('`ban()` and `only()` can be invoked only once in total');
	}
	var container = Array.isArray(list) ? list : [list];
	disable = container.slice(0);
}

function only(list) {
	if (disable || enable) {
		utils.exit('`ban()` and `only()` can be invoked only once in total');
	}
	var container = Array.isArray(list) ? list : [list];
	enable = container.slice(0);
}

function include(dir) {
	var container = dir;
	if (!Array.isArray(container)) {
		if (typeof dir === 'string') {
			container = [dir];
		} else {
			utils.exit('`include()` accepts an array or a string only');
		}
	}
	container.forEach(function append(dirpath) {
		var resolve = _path2.default.resolve(dirpath);
		if (dirpaths.indexOf(resolve) < 0) {
			if (!_fs2.default.existsSync(resolve)) {
				utils.exit('Unable to resolve path:\n' + dirpath);
			}
			dirpaths.push(resolve);
		}
	});
}

function load(gulp, context) {
	var fns = loaddir(builtin, function filterBuiltinTasks(file) {
		if (filterTasks(file)) {
			var basename = RegExp.$1;
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
		var tasks = loaddir(dir, filterTasks);
		fns.push.apply(fns, (0, _toConsumableArray3.default)(tasks));
	});
	fns.forEach(function (fn) {
		return fn.call(context, gulp);
	});
}

function create(gulp, _ref) {
	var commands = _ref.commands;

	var stages = ['dev', 'build'];
	var names = commands.filter(function (task) {
		return stages.indexOf(task) > -1;
	});
	if (!names.length) {
		return;
	}
	if (names.length > 1) {
		utils.exit('Unable to run different stages in the same time');
	}

	var stage = names.shift();
	var tree = {
		before: [],
		normal: [],
		after: []
	};

	var re = new RegExp('^(default|' + stage + '):((before|after):)?([\\s\\S]+)$');
	gulp.tree().nodes.forEach(function push(task) {
		if (re.test(task)) {
			var type = RegExp.$3 || 'normal';
			tree[type].push(task);
		}
	});

	var args = [];
	var append = function append(arr) {
		if (arr.length) {
			args.push(gulp.parallel.apply(gulp, (0, _toConsumableArray3.default)(arr)));
		}
	};
	append(tree.before);
	append(tree.normal);
	append(tree.after);
	if (args.length) {
		gulp.task(stage, gulp.series.apply(gulp, args));
	}
}