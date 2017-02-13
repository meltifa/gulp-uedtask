'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

var _library = require('../library');

var _library2 = _interopRequireDefault(_library);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Task = function () {
	function Task() {
		_classCallCheck(this, Task);

		this.tasks = null;
		this.defaultEndCb = [];
		this.taskNames = [];
		this.isBuild = -1 < process.argv.indexOf('build');
		this.browser = _browserSync2.default.create();
		this.gulp = this._bindGulp(_gulp2.default);
		this.ban = this.ban.bind(this);
		this.only = this.only.bind(this);
		this.run = this.run.bind(this);
		this.Library = _library2.default;
		this.defaultEnd = this.defaultEnd.bind(this);
	}

	_createClass(Task, [{
		key: '_bindGulp',
		value: function _bindGulp(gulp) {
			var defaultGulpTask = gulp.task.bind(gulp);
			var taskNames = this.taskNames;
			gulp.task = function (name) {
				for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
					args[_key - 1] = arguments[_key];
				}

				if (0 > taskNames.indexOf(name)) {
					taskNames.push(name);
				}
				return defaultGulpTask.apply(undefined, [name].concat(args));
			};
			return gulp;
		}
	}, {
		key: '_use',
		value: function _use(taskNameList, isOnly) {
			var _this = this;

			if (null === this.tasks) {
				(function () {
					var taskNames = Array.isArray(taskNameList) ? [].concat(_toConsumableArray(taskNameList)) : [taskNameList];
					_this.tasks = _fs2.default.readdirSync(__dirname + '/tasks').reduce(function (tasks, file) {
						var pathname = _path2.default.resolve(__dirname + '/tasks', file);
						if (_fs2.default.lstatSync(pathname).isFile()) {
							var name = _path2.default.parse(pathname).name;
							var isDefault = 'default' === name;
							var inList = -1 < taskNames.indexOf(name);
							var condition = isOnly ? !isDefault && inList : isDefault || !inList;
							if (condition) {
								var lib = require(pathname);
								var handler = 'function' === typeof lib ? lib : 'function' === typeof lib.default ? lib.default : null;
								if (handler) {
									tasks[isDefault ? 'unshift' : 'push'](handler);
								}
							}
						}
						return tasks;
					}, []).reverse();
				})();
			}
			return this;
		}
	}, {
		key: 'ban',
		value: function ban(taskNameList) {
			return this._use(taskNameList, false);
		}
	}, {
		key: 'only',
		value: function only(taskNameList) {
			return this._use(taskNameList, true);
		}
	}, {
		key: 'defaultEnd',
		value: function defaultEnd(cb) {
			if ('function' === typeof cb) {
				this.defaultEndCb.push(cb);
			}
			return this;
		}
	}, {
		key: 'run',
		value: function run(options, defaultTaskCb) {
			var _this2 = this;

			var args = void 0,
			    cb = void 0;
			if ('function' === typeof options) {
				cb = options;
				args = {};
			} else {
				args = Object(options);
				cb = defaultTaskCb;
			}
			if (null === this.tasks) {
				this.ban([]);
			}
			this.defaultEnd(cb);
			var tasks = this.tasks,
			    gulp = this.gulp;

			tasks.forEach(function (task) {
				return task(gulp, args, _this2);
			});
		}
	}]);

	return Task;
}();

module.exports = new Task();