import browserSync from 'browser-sync';
import { throttle } from '../utils';

export default function browser() {
	const { config, commands, on, emit } = this;

	// 不是开发阶段不启动浏览器刷新
	if (commands.indexOf('dev') < 0) {
		return;
	}

	let reload;
	on('task-end', function init({ task }) {
		// `dev` 执行完毕后，启动服务
		if (task === 'dev') {
			const options = {
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
				options.port = typeof config.port === 'number'
					? config.port
					: Math.floor(9999 * Math.random());
			}
			const bs = browserSync.create();
			bs.init(options);
			// 延时执行刷新
			reload = throttle(bs.reload);
		} else {
		// 别的任务就触发重载事件
			emit('reload');
		}
	});

	// 触发重载事件之前确保服务器已经启动
	on('reload', () => reload && reload());
}