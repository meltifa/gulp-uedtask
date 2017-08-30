'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = browser;

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function browser() {
	var config = this.config,
	    commands = this.commands,
	    on = this.on,
	    emit = this.emit;

	// 不是开发阶段不启动浏览器刷新

	if (commands.indexOf('dev') < 0) {
		return;
	}

	var reload = void 0;
	on('task-end', function init(_ref) {
		var task = _ref.task;

		// `dev` 执行完毕后，启动服务
		if (task === 'dev') {
			var options = {
				server: {
					// 服务器根目录
					baseDir: 'dist',
					// 首页为目录索引
					directory: true
				},
				// 静态资源目录
				// 图片和JS等在开发过程中没有生成到 dist 目录
				// 因此这里要指定 src 目录
				serveStatic: ['dist', 'src'],
				// 默认打开IP地址
				open: 'external',
				// 控制台无输出
				logLevel: 'silent',
				// 不需要用户控制界面
				ui: false,
				// 不开启跨设别同步
				ghostMode: false,
				// 添加允许跨域头
				cors: true
			};
			// 可以指定一个端口
			if (config.port) {
				options.port = typeof config.port === 'number' ? config.port : Math.floor(9999 * Math.random());
			}
			var bs = _browserSync2.default.create();
			bs.init(options);
			// 延时执行刷新
			reload = (0, _utils.throttle)(bs.reload);
		} else {
			// 别的任务就触发重载事件
			emit('reload');
		}
	});

	// 触发重载事件之前确保服务器已经启动
	on('reload', function () {
		return reload && reload();
	});
}