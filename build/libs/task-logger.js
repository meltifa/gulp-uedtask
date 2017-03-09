'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_COMMAND = exports.DEFAULT_COMMAND = 'default';
var SORT_COMMANDS = exports.SORT_COMMANDS = ['dev', 'build'];
var SIDE_HOOKS = exports.SIDE_HOOKS = ['before', 'after'];
var MAIN_HOOK = exports.MAIN_HOOK = 'main';

var TaskLogger = function () {
	function TaskLogger() {
		_classCallCheck(this, TaskLogger);
	}

	_createClass(TaskLogger, null, [{
		key: 'getCommands',
		value: function getCommands() {
			return this.commandTasks;
		}
	}, {
		key: 'getAllTasks',
		value: function getAllTasks() {
			return this.allTasks.slice();
		}
	}, {
		key: 'addTask',
		value: function addTask(name) {
			var _name$split = name.split(':'),
			    _name$split2 = _slicedToArray(_name$split, 2),
			    command = _name$split2[0],
			    hook = _name$split2[1];

			var commands = this.parseCommands(command);
			if (commands.length) {
				var hooks = this.parseHooks(hook);
				this.logCommandTask({ commands: commands, hooks: hooks, name: name });
			}
			this.logAllTasks(name);
		}
	}, {
		key: 'parseCommands',
		value: function parseCommands() {
			var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

			if (DEFAULT_COMMAND === str) {
				return [].concat(SORT_COMMANDS);
			}
			return str.split(',').filter(function (command) {
				return -1 < SORT_COMMANDS.indexOf(command);
			});
		}
	}, {
		key: 'parseHooks',
		value: function parseHooks() {
			var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

			var sideHooks = str.split(',').filter(function (hook) {
				return -1 < SIDE_HOOKS.indexOf(hook);
			});
			return sideHooks.length ? sideHooks : [MAIN_HOOK];
		}
	}, {
		key: 'logAllTasks',
		value: function logAllTasks(name) {
			var allTasks = this.allTasks;
			if (0 > allTasks.indexOf(name)) {
				allTasks.push(name);
			}
		}
	}, {
		key: 'logCommandTask',
		value: function logCommandTask(_ref) {
			var commands = _ref.commands,
			    hooks = _ref.hooks,
			    name = _ref.name;

			var commandTasks = this.commandTasks;
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = commands[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var command = _step.value;

					if (!commandTasks.hasOwnProperty(command)) {
						Object.defineProperty(commandTasks, command, {
							enumerable: true,
							value: {}
						});
					}
					var commandTask = commandTasks[command];
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = hooks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var hook = _step2.value;

							if (!commandTask.hasOwnProperty(hook)) {
								Object.defineProperty(commandTask, hook, {
									enumerable: true,
									value: []
								});
							}
							var namespace = commandTask[hook];
							if (0 > namespace.indexOf(hook)) {
								namespace.push(name);
							}
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator.return) {
						_iterator.return();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}
		}
	}]);

	return TaskLogger;
}();

TaskLogger.allTasks = [];
TaskLogger.commandTasks = {};
exports.default = TaskLogger;