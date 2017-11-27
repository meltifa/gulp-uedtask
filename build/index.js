'use strict';

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

function isLikeStream(obj) {
	return Boolean(obj && 'function' === typeof obj.pipe && 'function' === typeof obj.on);
}

function isLikePromise(obj) {
	return Boolean(obj && 'function' === typeof obj.then && 'function' === typeof obj.catch);
}

// 原始 Gulp 的 task() 方法
const gulpTask = _gulp2.default.task.bind(_gulp2.default);

// 包裹原有的方法，用来接入任务开始和结束的广播，并登记任务
_gulp2.default.task = (name, ...args) => {
	if ('string' !== typeof name || !name) {
		throw new Error('Task name must be a string!');
	}
	const handler = args.pop();
	let lastArg = handler;

	// 包裹原有的处理方法
	if ('function' === typeof handler) {
		lastArg = function () {
			return new Promise(resolve => {
				// 广播任务开始
				_taskListener2.default.emit('start', name);
				// 执行原方法
				const result = handler.call(this, resolve);
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
		lastArg = function (cb) {
			// 广播任务开始和结束
			_taskListener2.default.emit('start', name);
			_taskListener2.default.emit('end', name);
			return cb();
		};
	}
	_taskLogger2.default.addTask(name);
	return gulpTask(name, ...args, lastArg);
};

class UedTask {

	static getTaskFiles(filter) {
		const taskFiles = _fs2.default.readdirSync(__dirname + '/tasks').reduce(function (files, task) {
			const match = task.match(/^([-\w]+)\.js$/i);
			if (match) {
				files.push(match[1]);
			}
			return files;
		}, []);
		return 'function' === typeof filter ? taskFiles.filter(filter) : taskFiles;
	}

	// 暴露给内部任务的工具
	static getSafeContext() {
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

	static evalFiles(options) {
		const safeContext = this.getSafeContext();
		this.activatedFiles.forEach(function (file) {
			const filePath = __dirname + '/tasks/' + file + '.js';
			const req = require(filePath);
			const handler = req.__esModule && 'function' === typeof req.default ? req.default : req;
			if ('function' === typeof handler) {
				handler(options, safeContext);
			}
		});
	}

	static register(fn) {
		if (fn) {
			const handler = fn.__esModule && 'function' === typeof fn.default ? fn.default : 'function' === typeof fn ? fn : null;
			if (handler) {
				const safeContext = this.getSafeContext();
				handler(safeContext);
				return this;
			}
		}
		throw new TypeError('The argument must be a function!');
	}

	static only(tasks) {
		const taskList = Array.isArray(tasks) ? tasks : [tasks];
		this.activatedFiles = UedTask.getTaskFiles(file => -1 < taskList.indexOf(file));
		return this;
	}

	static ban(tasks) {
		const taskList = Array.isArray(tasks) ? tasks : [tasks];
		this.activatedFiles = UedTask.getTaskFiles(file => 0 > taskList.indexOf(file));
		return this;
	}

	static createSequence(gulpCommands, callback) {
		const { commands, tasks } = gulpCommands;
		const loggedCommands = _taskLogger2.default.getCommands();
		const cb = 'function' === typeof callback ? callback : Function.prototype;

		// 如果执行的任务内有命令集，动态构造之
		if (commands.length) {
			commands.forEach(function (command) {
				if ('undefined' === typeof loggedCommands[command]) {
					throw new Error('No tasks were provided for `' + command + '` to run!');
				}
				const { before = [], main = [], after = [] } = loggedCommands[command];
				// 这里得用原始的 task() 方法，否则栈溢出
				const sequence = [];
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
		(0, _runSequence2.default)(...tasks, cb);
	}

	static run(options = {}, callback) {
		let opt = options,
		    cb = callback;
		if ('function' === typeof options) {
			[opt, cb] = [{}, opt];
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
}

UedTask.activatedFiles = null;
module.exports = {
	gulp: _gulp2.default,
	run: UedTask.run.bind(UedTask),
	ban: UedTask.ban.bind(UedTask),
	only: UedTask.only.bind(UedTask),
	register: UedTask.register.bind(UedTask)
};