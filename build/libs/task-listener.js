'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
const EVENTS = ['start', 'end', 'ready'];

class TaskListener {

	static emit(event, task = '*') {
		if (0 > EVENTS.indexOf(event)) {
			throw new Error('Unknow event type!');
		}
		const listeners = this.listeners;
		const taskListeners = listeners[task];
		let callbacks = '*' !== task ? listeners['*'][event] : [];
		if (taskListeners) {
			const namespace = taskListeners[event];
			if (namespace) {
				callbacks = callbacks.concat(namespace);
			}
		}
		callbacks.forEach(cb => cb({ event, task }));
	}

	static subscribe(event, task, listener) {
		let tsk = task,
		    lsr = listener;
		if ('function' === typeof task) {
			[tsk, lsr] = ['*', tsk];
		}
		if ('function' !== typeof lsr) {
			throw new TypeError('`listener` must be a function!');
		}
		if (0 > EVENTS.indexOf(event)) {
			throw new Error('Unknow event type!');
		}
		const listeners = this.listeners;
		const taskListeners = listeners[tsk] || (listeners[tsk] = {});
		const namespace = taskListeners[event] || (taskListeners[event] = []);
		if (0 > namespace.indexOf(lsr)) {
			namespace.push(lsr);
			return true;
		}
		return false;
	}

	static unsubscribe(event, task, listener) {
		let tsk = task,
		    lsr = listener;
		if ('function' === typeof task) {
			[tsk, lsr] = ['*', tsk];
		}
		if ('function' !== typeof lsr) {
			throw new TypeError('`listener` must be a function!');
		}
		const taskListeners = this.listeners[tsk];
		if (taskListeners) {
			const namespace = taskListeners[event];
			if (namespace) {
				const index = namespace.indexOf(lsr);
				if (-1 < index) {
					namespace.splice(index, 1);
					return true;
				}
			}
		}
		return false;
	}
}
exports.default = TaskListener;
TaskListener.listeners = {
	'*': {
		start: [],
		end: []
	}
};