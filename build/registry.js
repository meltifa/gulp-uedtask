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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-enable import/no-extraneous-dependencies */

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
			this.on('log', function () {
				// 将所有连续消息存储起来最后一波打印
				var timer = void 0;
				var messages = [];
				return function log(message) {
					messages.push(message);
					clearTimeout(timer);
					timer = setTimeout(function delay() {
						messages.splice(0).forEach(function print(msg) {
							if (msg) {
								/* eslint-disable no-console */
								if (msg.title) {
									console.warn('\x1B[31m' + msg.title + '\x1B[0m');
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
			}());
		}

		// 触发 reload 事件
		// 新增文件的增删没有调起 gulp.watch 的回调
		// 因此需要用 wather.on() 来实现回调

	}, {
		key: 'reload',
		value: function reload(glob) {
			var _this2 = this;

			var watcher = _gulp2.default.watch(glob);
			var emitReload = function emitReload() {
				return _this2.emit('reload');
			};
			watcher.on('unlink', emitReload);
			watcher.on('add', emitReload);
			watcher.on('change', emitReload);
		}

		// 只能在 setConfig 之后再调用

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
			var _this3 = this;

			var _tasks = this._tasks,
			    emit = this.emit;

			var execute = function execute() {
				// 广播任务开始事件
				emit('task-start', { task: task });
				// 获取上下文要在 execute() 内部
				// 因为注册任务的时候还没有调用 run() 来注入配置
				var context = _this3.getContext();
				return new _promise2.default(function wrap(resolve, reject) {
					// 调用原本任务方法
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
					// 定义任务要么返回一个 stream 或 promise
					// 要么自己调用 cb() 来告知任务完成
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
/* eslint-disable import/no-extraneous-dependencies */


exports.default = Registry;