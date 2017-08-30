'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _undertakerRegistry = require('undertaker-registry');

var _undertakerRegistry2 = _interopRequireDefault(_undertakerRegistry);

var _events = require('events');

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*eslint-disable*/
var Registry = function (_Undertaker) {
	(0, _inherits3.default)(Registry, _Undertaker);

	function Registry(options) {
		(0, _classCallCheck3.default)(this, Registry);

		var _this = (0, _possibleConstructorReturn3.default)(this, (Registry.__proto__ || (0, _getPrototypeOf2.default)(Registry)).call(this));

		var emitter = new _events.EventEmitter();
		_this.on = emitter.on.bind(emitter);
		_this.emit = emitter.emit.bind(emitter);
		_this.once = emitter.once.bind(emitter);
		_this.off = emitter.removeListener.bind(emitter);
		_this.reload = _this.reload.bind(_this);
		_this._config = (0, _create2.default)(null);
		_this._commands = options.commands.slice();

		_this.bind();
		return _this;
	}

	(0, _createClass3.default)(Registry, [{
		key: 'bind',
		value: function bind() {
			this.on('log', (0, _utils.throttle)(function (message) {
				if (message) {
					/*eslint-disable*/
					if (message.title) {
						console.log('\x1B[31m' + message.title + '\x1B[0m');
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
	}, {
		key: 'reload',
		value: function reload() {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			this.emit.apply(this, ['reload'].concat(args));
		}
	}, {
		key: 'getContext',
		value: function getContext() {
			return {
				on: this.on,
				off: this.off,
				emit: this.emit,
				once: this.once,
				reload: this.reload,
				config: (0, _assign2.default)({}, this._config),
				commands: this._commands.slice()
			};
		}
	}, {
		key: 'setConfig',
		value: function setConfig(config) {
			(0, _assign2.default)(this._config, config);
		}
	}, {
		key: 'set',
		value: function set(task, fn) {
			var _this2 = this;

			var _tasks = this._tasks,
			    emit = this.emit;

			var execute = function execute() {
				emit('task-start', { task: task });
				var context = _this2.getContext();
				return new _promise2.default(function wrap(resolve, reject) {
					var result = fn.call(context, function end(err) {
						var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

						if (err) {
							return reject(err);
						}
						if (payload.task === task) {
							return resolve(payload);
						}
						return resolve();
					});
					if (result instanceof _promise2.default) {
						result.then(resolve, reject);
					} else if (result instanceof _stream2.default) {
						result.on('error', reject).on('end', resolve).on('finish', resolve);
					}
				}).then(function succeed(payload) {
					emit('task-end', (0, _assign2.default)({}, payload, { task: task }));
				}).catch(function fail(error) {
					emit('task-end', { task: task, error: error });
				});
			};
			_tasks[task] = execute;
			return execute;
		}
	}]);
	return Registry;
}(_undertakerRegistry2.default);
/*eslint-enable*/


exports.default = Registry;