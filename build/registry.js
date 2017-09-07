'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _freeze = require('babel-runtime/core-js/object/freeze');

var _freeze2 = _interopRequireDefault(_freeze);

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

	function Registry(_ref) {
		var config = _ref.config,
		    commands = _ref.commands;
		(0, _classCallCheck3.default)(this, Registry);

		var _this = (0, _possibleConstructorReturn3.default)(this, (Registry.__proto__ || (0, _getPrototypeOf2.default)(Registry)).call(this));

		var emitter = new _events.EventEmitter();
		_this.context = (0, _freeze2.default)({
			on: emitter.on.bind(emitter),
			off: emitter.removeListener.bind(emitter),
			emit: emitter.emit.bind(emitter),
			once: emitter.once.bind(emitter),
			reload: _this.reload.bind(_this),
			config: (0, _freeze2.default)((0, _assign2.default)({}, config)),
			commands: (0, _freeze2.default)(commands.slice())
		});
		_this.bind();
		return _this;
	}

	(0, _createClass3.default)(Registry, [{
		key: 'bind',
		value: function bind() {
			this.context.on('log', function () {
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
				return _this2.context.emit('reload');
			};
			watcher.on('unlink', emitReload);
			watcher.on('add', emitReload);
			watcher.on('change', emitReload);
		}
	}, {
		key: 'set',
		value: function set(task, fn) {
			var _tasks = this._tasks,
			    context = this.context;

			var emit = context.emit;
			var execute = function execute() {
				// 广播任务开始事件
				emit('task-start', { task: task });
				// 获取上下文要在 execute() 内部
				// 因为注册任务的时候还没有调用 run() 来注入配置
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
			execute.displayName = task;
			_tasks[task] = execute;
			return execute;
		}
	}]);
	return Registry;
}(_undertakerRegistry2.default);
/* eslint-disable import/no-extraneous-dependencies */


exports.default = Registry;