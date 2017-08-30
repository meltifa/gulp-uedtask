import Undertaker from 'undertaker-registry';
import { EventEmitter } from 'events';
import Stream from 'stream';
/*eslint-disable*/
import gulp from 'gulp';
/*eslint-enable*/
import { throttle } from './utils';

export default class Registry extends Undertaker {
	constructor(options) {
		super();
		const emitter = new EventEmitter();
		this.on = emitter.on.bind(emitter);
		this.emit = emitter.emit.bind(emitter);
		this.once = emitter.once.bind(emitter);
		this.off = emitter.removeListener.bind(emitter);
		this.reload = this.reload.bind(this);
		this._config = Object.create(null);
		this._commands = options.commands.slice();

		this.bind();
	}

	bind() {
		this.on('log', throttle((message) => {
			if (message) {
				/*eslint-disable*/
				if (message.title) {
					console.log(`\x1b[31m${message.title}\x1b[0m`);
					if (message.content) {
						console.log(message.content);
					}
				} else {
					console.log(message);
				}
				/*eslint-enable*/
			}
		}), 500);
	}

	reload(...args) {
		this.emit('reload', ...args);
	}

	getContext() {
		return {
			on: this.on,
			off: this.off,
			emit: this.emit,
			once: this.once,
			reload: this.reload,
			config: Object.assign({}, this._config),
			commands: this._commands.slice()
		};
	}

	setConfig(config) {
		Object.assign(this._config, config);
	}

	set(task, fn) {
		const { _tasks, emit } = this;
		const execute = () => {
			emit('task-start', { task });
			const context = this.getContext();
			return new Promise(function wrap(resolve, reject) {
				const result = fn.call(context, function end(err, payload = {}) {
					if (err) {
						return reject(err);
					}
					if (payload.task === task) {
						return resolve(payload);
					}
					return resolve();
				});
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
		_tasks[task] = execute;
		return execute;
	}
}