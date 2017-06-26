'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _taskCommands = require('./libs/task-commands');

var _taskCommands2 = _interopRequireDefault(_taskCommands);

var _taskLogger = require('./libs/task-logger');

var _taskLogger2 = _interopRequireDefault(_taskLogger);

var _taskListener = require('./libs/task-listener');

var _taskListener2 = _interopRequireDefault(_taskListener);

var _runSequence = require('run-sequence');

var _runSequence2 = _interopRequireDefault(_runSequence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function isLikeStream(obj) {
	return Boolean(obj && 'function' === typeof obj.pipe && 'function' === typeof obj.on);
}

function isLikePromise(obj) {
	return Boolean(obj && 'function' === typeof obj.then && 'function' === typeof obj.catch);
}

// 原始 Gulp 的 task() 方法
var gulpTask = _gulp2.default.task.bind(_gulp2.default);

// 包裹原有的方法，用来接入任务开始和结束的广播，并登记任务
_gulp2.default.task = function (name) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	if ('string' !== typeof name || !name) {
		throw new Error('Task name must be a string!');
	}
	var handler = args.pop();
	var lastArg = handler;

	// 包裹原有的处理方法
	if ('function' === typeof handler) {
		lastArg = function lastArg() {
			var _this = this;

			return new Promise(function (resolve) {
				// 广播任务开始
				_taskListener2.default.emit('start', name);
				// 执行原方法
				var result = handler.call(_this, resolve);
				// 返回流的时候绑定事件得知结束
				if (isLikeStream(result)) {
					result.on('end', resolve);
					result.on('finish', resolve);
					// 返回 Promise 添加 then()
				} else if (isLikePromise(result)) {
					result.then(resolve);
					// 否则处理方法接受到 resolve() 后自行调用
					// 但如果原方法不接受参数，则标志任务直接结束
				} else if (!handler.length) {
					resolve();
				}
				// 任务结束后广播
			}).then(function () {
				_taskListener2.default.emit('end', name);
			});
		};
		// task() 没有执行函数，可能只是添加了依赖
	} else {
		args.push(handler);
		lastArg = function lastArg(cb) {
			// 广播任务开始和结束
			_taskListener2.default.emit('start', name);
			_taskListener2.default.emit('end', name);
			return cb();
		};
	}
	_taskLogger2.default.addTask(name);
	return gulpTask.apply(undefined, [name].concat(args, [lastArg]));
};

var UedTask = function () {
	function UedTask() {
		_classCallCheck(this, UedTask);
	}

	_createClass(UedTask, null, [{
		key: 'getTaskFiles',
		value: function getTaskFiles(filter) {
			var taskFiles = _fs2.default.readdirSync(__dirname + '/tasks').reduce(function (files, task) {
				var match = task.match(/^([-\w]+)\.js$/i);
				if (match) {
					files.push(match[1]);
				}
				return files;
			}, []);
			return 'function' === typeof filter ? taskFiles.filter(filter) : taskFiles;
		}

		// 暴露给内部任务的工具

	}, {
		key: 'getSafeContext',
		value: function getSafeContext() {
			return {
				gulp: _gulp2.default,
				TaskLogger: {
					getCommands: _taskLogger2.default.getCommands.bind(_taskLogger2.default),
					getAllTasks: _taskLogger2.default.getAllTasks.bind(_taskLogger2.default)
				},
				TaskListener: {
					subscribe: _taskListener2.default.subscribe.bind(_taskListener2.default),
					unsubscribe: _taskListener2.default.unsubscribe.bind(_taskListener2.default)
				}
			};
		}
	}, {
		key: 'evalFiles',
		value: function evalFiles(options) {
			var safeContext = this.getSafeContext();
			this.activatedFiles.forEach(function (file) {
				var filePath = __dirname + '/tasks/' + file + '.js';
				var req = require(filePath);
				var handler = req.__esModule && 'function' === typeof req.default ? req.default : req;
				if ('function' === typeof handler) {
					handler(options, safeContext);
				}
			});
		}
	}, {
		key: 'register',
		value: function register(fn) {
			if (fn) {
				var handler = fn.__esModule && 'function' === typeof fn.default ? fn.default : 'function' === typeof fn ? fn : null;
				if (handler) {
					var safeContext = this.getSafeContext();
					handler(safeContext);
					return this;
				}
			}
			throw new TypeError('The argument must be a function!');
		}
	}, {
		key: 'only',
		value: function only(tasks) {
			var taskList = Array.isArray(tasks) ? tasks : [tasks];
			this.activatedFiles = UedTask.getTaskFiles(function (file) {
				return -1 < taskList.indexOf(file);
			});
			return this;
		}
	}, {
		key: 'ban',
		value: function ban(tasks) {
			var taskList = Array.isArray(tasks) ? tasks : [tasks];
			this.activatedFiles = UedTask.getTaskFiles(function (file) {
				return 0 > taskList.indexOf(file);
			});
			return this;
		}
	}, {
		key: 'createSequence',
		value: function createSequence(gulpCommands, callback) {
			var commands = gulpCommands.commands,
			    tasks = gulpCommands.tasks;

			var loggedCommands = _taskLogger2.default.getCommands();
			var cb = 'function' === typeof callback ? callback : Function.prototype;

			// 如果执行的任务内有命令集，动态构造之
			if (commands.length) {
				commands.forEach(function (command) {
					if ('undefined' === typeof loggedCommands[command]) {
						throw new Error('No tasks were provided for `' + command + '` to run!');
					}
					var _loggedCommands$comma = loggedCommands[command],
					    _loggedCommands$comma2 = _loggedCommands$comma.before,
					    before = _loggedCommands$comma2 === undefined ? [] : _loggedCommands$comma2,
					    _loggedCommands$comma3 = _loggedCommands$comma.main,
					    main = _loggedCommands$comma3 === undefined ? [] : _loggedCommands$comma3,
					    _loggedCommands$comma4 = _loggedCommands$comma.after,
					    after = _loggedCommands$comma4 === undefined ? [] : _loggedCommands$comma4;
					// 这里得用原始的 task() 方法，否则栈溢出

					var sequence = [];
					if (after.length) {
						sequence.unshift(after);
					}
					if (main.length) {
						sequence.unshift(main);
					}
					if (before.length) {
						sequence.unshift(before);
					}
					gulpTask(command, function (end) {
						_runSequence2.default.apply(null, sequence.concat([function () {
							return cb(), end();
						}]));
					});
				});
			}

			// 执行各任务
			_runSequence2.default.apply(undefined, _toConsumableArray(tasks).concat([cb]));
		}
	}, {
		key: 'run',
		value: function run() {
			var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
			var callback = arguments[1];

			var opt = options,
			    cb = callback;
			if ('function' === typeof options) {
				var _ref = [{}, opt];
				opt = _ref[0];
				cb = _ref[1];
			}

			if (!this.activatedFiles) {
				this.activatedFiles = this.getTaskFiles();
			}

			// 执行被激活的各个内部脚本
			this.evalFiles(Object.assign({}, options, _taskCommands2.default.parameters));
			// 任务全部准备完毕
			_taskListener2.default.emit('ready');
			// 执行各任务
			this.createSequence(_taskCommands2.default, cb);
		}
	}]);

	return UedTask;
}();

UedTask.activatedFiles = null;


module.exports = {
	gulp: _gulp2.default,
	run: UedTask.run.bind(UedTask),
	ban: UedTask.ban.bind(UedTask),
	only: UedTask.only.bind(UedTask),
	register: UedTask.register.bind(UedTask)
};