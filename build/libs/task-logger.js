'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MAIN_HOOK = exports.SIDE_HOOKS = exports.SORT_COMMANDS = exports.DEFAULT_COMMAND = undefined;

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_COMMAND = exports.DEFAULT_COMMAND = 'default';
var SORT_COMMANDS = exports.SORT_COMMANDS = ['dev', 'build'];
var SIDE_HOOKS = exports.SIDE_HOOKS = ['before', 'after'];
var MAIN_HOOK = exports.MAIN_HOOK = 'main';

var TaskLogger = function () {
	function TaskLogger() {
		(0, _classCallCheck3.default)(this, TaskLogger);
	}

	(0, _createClass3.default)(TaskLogger, null, [{
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
			    _name$split2 = (0, _slicedToArray3.default)(_name$split, 2),
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
				for (var _iterator = (0, _getIterator3.default)(commands), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var command = _step.value;

					if (!commandTasks.hasOwnProperty(command)) {
						(0, _defineProperty2.default)(commandTasks, command, {
							enumerable: true,
							value: {}
						});
					}
					var commandTask = commandTasks[command];
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = (0, _getIterator3.default)(hooks), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var hook = _step2.value;

							if (!commandTask.hasOwnProperty(hook)) {
								(0, _defineProperty2.default)(commandTask, hook, {
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