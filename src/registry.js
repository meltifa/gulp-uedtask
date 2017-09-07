import Undertaker from 'undertaker-registry';
import { EventEmitter } from 'events';
import Stream from 'stream';
/* eslint-disable import/no-extraneous-dependencies */
import gulp from 'gulp';
/* eslint-enable import/no-extraneous-dependencies */

export default class Registry extends Undertaker {
	constructor({ config, commands }) {
		super();
		const emitter = new EventEmitter();
		this.context = Object.freeze({
			on: emitter.on.bind(emitter),
			off: emitter.removeListener.bind(emitter),
			emit: emitter.emit.bind(emitter),
			once: emitter.once.bind(emitter),
			reload: this.reload.bind(this),
			config: Object.freeze(Object.assign({}, config)),
			commands: Object.freeze(commands.slice())
		});
		this.bind();
	}

	bind() {
		this.context.on('log', (() => {
			// 将所有连续消息存储起来最后一波打印
			let timer;
			const messages = [];
			return function log(message) {
				messages.push(message);
				clearTimeout(timer);
				timer = setTimeout(function delay() {
					messages.splice(0).forEach(function print(msg) {
						if (msg) {
							/* eslint-disable no-console */
							if (msg.title) {
								console.warn(`\x1b[31m${msg.title}\x1b[0m`);
								if (msg.content) {
									console.warn(msg.content);
								}
							} else {
								console.warn(msg);
							}
							/* eslint-enable no-console */
						}
					});
				}, 500);
			};
		})());
	}

	// 触发 reload 事件
	// 新增文件的增删没有调起 gulp.watch 的回调
	// 因此需要用 wather.on() 来实现回调
	reload(glob) {
		const watcher = gulp.watch(glob);
		const emitReload = () => this.context.emit('reload');
		watcher.on('unlink', emitReload);
		watcher.on('add', emitReload);
		watcher.on('change', emitReload);
	}

	set(task, fn) {
		const { _tasks, context } = this;
		const emit = context.emit;
		const execute = () => {
			// 广播任务开始事件
			emit('task-start', { task });
			// 获取上下文要在 execute() 内部
			// 因为注册任务的时候还没有调用 run() 来注入配置
			return new Promise(function wrap(resolve, reject) {
				// 调用原本任务方法
				const result = fn.call(context, function end(err, payload = {}) {
					if (err) {
						return reject(err);
					}
					if (payload.task === task) {
						return resolve(payload);
					}
					return resolve();
				});
				// 定义任务要么返回一个 stream 或 promise
				// 要么自己调用 cb() 来告知任务完成
				if (result instanceof Promise) {
					result.then(resolve, reject);
				} else if (result instanceof Stream) {
					result.on('error', reject).on('end', resolve).on('finish', resolve);
				}
			}).then(function succeed(payload) {
				emit('task-end', Object.assign({}, payload, { task }));
			}).catch(function fail(error) {
				emit('task-end', { task, error });
			});
		};
		execute.displayName = task;
		_tasks[task] = execute;
		return execute;
	}
}