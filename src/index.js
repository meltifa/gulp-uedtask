'use strict';

import fs from 'fs';
import gulp from 'gulp';
import gulpCommands from './libs/task-commands';
import TaskLogger from './libs/task-logger';
import TaskListener from './libs/task-listener';
import runSequence from 'run-sequence';

function isLikeStream(obj) {
	return Boolean(obj && 'function' === typeof obj.pipe && 'function' === typeof obj.on);
}

function isLikePromise(obj) {
	return Boolean(obj && 'function' === typeof obj.then && 'function' === typeof obj.catch);
}

// 原始 Gulp 的 task() 方法
const gulpTask = gulp.task.bind(gulp);

// 包裹原有的方法，用来接入任务开始和结束的广播，并登记任务
gulp.task = (name, ...args) => {
	if('string' !== typeof name || !name) {
		throw new Error('Task name must be a string!');
	}
	const handler = args.pop();
	let lastArg = handler;

	// 包裹原有的处理方法
	if('function' === typeof handler) {
		lastArg = function() {
			return new Promise(resolve => {
				// 广播任务开始
				TaskListener.emit('start', name);
				// 执行原方法
				const result = handler.call(this, resolve);
				// 返回流的时候绑定事件得知结束
				if(isLikeStream(result)) {
					result.on('end', resolve);
					result.on('finish', resolve);
				// 返回 Promise 添加 then()
				} else if(isLikePromise(result)) {
					result.then(resolve);
				// 否则处理方法接受到 resolve() 后自行调用
				// 但如果原方法不接受参数，则标志任务直接结束
				} else if(!handler.length) {
					resolve();
				}
			// 任务结束后广播
			}).then(function() {
				TaskListener.emit('end', name);
			});
		};
	// task() 没有执行函数，可能只是添加了依赖
	} else {
		args.push(handler);
		lastArg = function(cb) {
			// 广播任务开始和结束
			TaskListener.emit('start', name);
			TaskListener.emit('end', name);
			return cb();
		};
	}
	TaskLogger.addTask(name);
	return gulpTask(name, ...args, lastArg);
};

class UedTask {

	static activatedFiles = null;

	static getTaskFiles(filter) {
		const taskFiles = fs.readdirSync(__dirname + '/tasks').reduce(function(files, task) {
			const match = task.match(/^([-\w]+)\.js$/i);
			if(match) {
				files.push(match[1]);
			}
			return files;
		}, []);
		return 'function' === typeof filter ? taskFiles.filter(filter) : taskFiles;
	}

	// 暴露给内部任务的工具
	static getSafeContext() {
		return {
			gulp,
			TaskLogger: {
				getCommands: TaskLogger.getCommands.bind(TaskLogger),
				getAllTasks: TaskLogger.getAllTasks.bind(TaskLogger)
			},
			TaskListener: {
				subscribe: TaskListener.subscribe.bind(TaskListener),
				unsubscribe: TaskListener.unsubscribe.bind(TaskListener)
			}
		};
	}

	static evalFiles(options) {
		const safeContext = this.getSafeContext();
		this.activatedFiles.forEach(function(file) {
			const filePath = __dirname + '/tasks/' + file + '.js';
			const req = require(filePath);
			const handler = req.__esModule && 'function' === typeof req.default ? req.default : req;
			if('function' === typeof handler) {
				handler(options, safeContext);
			}
		});
	}

	static register(fn) {
		if(fn) {
			const handler = fn.__esModule && 'function' === typeof fn.default
				? fn.default
				: 'function' === typeof fn ? fn : null
			;
			if(handler) {
				const safeContext = this.getSafeContext();
				handler(safeContext);
				return this;
			}
		}
		throw new TypeError('The argument must be a function!');
	}

	static only(tasks) {
		const taskList = Array.isArray(tasks) ? tasks : [ tasks ];
		this.activatedFiles = UedTask.getTaskFiles(file => -1 < taskList.indexOf(file));
		return this;
	}

	static ban(tasks) {
		const taskList = Array.isArray(tasks) ? tasks : [ tasks ];
		this.activatedFiles = UedTask.getTaskFiles(file => 0 > taskList.indexOf(file));
		return this;
	}

	static createSequence(gulpCommands, callback) {
		const { commands, tasks } = gulpCommands;
		const loggedCommands = TaskLogger.getCommands();
		const cb = 'function' === typeof callback ? callback : Function.prototype;

		// 如果执行的任务内有命令集，动态构造之
		if(commands.length) {
			commands.forEach(function(command) {
				const { before = [], main = [], after = [] } = loggedCommands[command];
				// 这里得用原始的 task() 方法，否则栈溢出
				gulpTask(command, function(cb) {
					runSequence(before, main, after, cb);
				});
			});
		}

		// 执行各任务
		runSequence(...tasks, cb);
	}

	static run(options = {}, callback) {
		let opt = options, cb = callback;
		if('function' === typeof options) {
			[ opt, cb ] = [ {}, opt ];
		}

		if(!this.activatedFiles) {
			this.activatedFiles = this.getTaskFiles();
		}

		// 执行被激活的各个内部脚本
		this.evalFiles(Object.assign({}, options, gulpCommands.parameters));
		// 任务全部准备完毕
		TaskListener.emit('ready');
		// 执行各任务
		this.createSequence(gulpCommands, cb);
	}
}

module.exports = {
	gulp,
	run: UedTask.run.bind(UedTask),
	ban: UedTask.ban.bind(UedTask),
	only: UedTask.only.bind(UedTask),
	register: UedTask.register.bind(UedTask)
};