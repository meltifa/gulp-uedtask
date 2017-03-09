'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EVENTS = ['start', 'end', 'ready'];

var TaskListener = function () {
	function TaskListener() {
		_classCallCheck(this, TaskListener);
	}

	_createClass(TaskListener, null, [{
		key: 'emit',
		value: function emit(event) {
			var task = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '*';

			if (0 > EVENTS.indexOf(event)) {
				throw new Error('Unknow event type!');
			}
			var listeners = this.listeners;
			var taskListeners = listeners[task];
			var callbacks = '*' !== task ? listeners['*'][event] : [];
			if (taskListeners) {
				var namespace = taskListeners[event];
				if (namespace) {
					callbacks = callbacks.concat(namespace);
				}
			}
			callbacks.forEach(function (cb) {
				return cb({ event: event, task: task });
			});
		}
	}, {
		key: 'subscribe',
		value: function subscribe(event, task, listener) {
			var tsk = task,
			    lsr = listener;
			if ('function' === typeof task) {
				var _ref = ['*', tsk];
				tsk = _ref[0];
				lsr = _ref[1];
			}
			if ('function' !== typeof lsr) {
				throw new TypeError('`listener` must be a function!');
			}
			if (0 > EVENTS.indexOf(event)) {
				throw new Error('Unknow event type!');
			}
			var listeners = this.listeners;
			var taskListeners = listeners[tsk] || (listeners[tsk] = {});
			var namespace = taskListeners[event] || (taskListeners[event] = []);
			if (0 > namespace.indexOf(lsr)) {
				namespace.push(lsr);
				return true;
			}
			return false;
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(event, task, listener) {
			var tsk = task,
			    lsr = listener;
			if ('function' === typeof task) {
				var _ref2 = ['*', tsk];
				tsk = _ref2[0];
				lsr = _ref2[1];
			}
			if ('function' !== typeof lsr) {
				throw new TypeError('`listener` must be a function!');
			}
			var taskListeners = this.listeners[tsk];
			if (taskListeners) {
				var namespace = taskListeners[event];
				if (namespace) {
					var index = namespace.indexOf(lsr);
					if (-1 < index) {
						namespace.splice(index, 1);
						return true;
					}
				}
			}
			return false;
		}
	}]);

	return TaskListener;
}();

TaskListener.listeners = {
	'*': {
		start: [],
		end: []
	}
};
exports.default = TaskListener;