import newer from 'gulp-newer';
import juicer from 'juicer';
import template from 'gulp-html-tpl';
import includer from 'gulp-file-include';

// Juicer 默认会清除换行等空白
// 导致模板内的 JavaScript 错误
// 因此必须关闭
juicer.set('strip', false);

const src = {
	// 入口文件
	entry: [
		'src/**/*.html',
		'!src/**/_*.html',
		'!src/{asset,template,inc}/**/*.html'
	],
	// 模板文件
	template: [
		'src/**/_*.html',
		'src/{template,inc}/**/*.html'
	]
};

// 模板配置
const tplOptions = {
	engine: juicer,
	data: { Math, Number, Boolean, String, Array, Object, JSON, RegExp, Date }
};

export default function html(gulp) {
	const { emit } = this;

	function compile(isNewer) {
		let stream = gulp.src(src.entry);
		// 根据是否需要加载 newer 分支
		// 更新模板文件的时候不加载 newer
		// 入口文件变动的时候加载
		if (isNewer) {
			stream = stream.pipe(newer('dist'));
		}
		return stream.pipe(includer())
			.on('error', function log(err) {
				emit('log', `fileIncluder Error!\n${err.message}`);
				this.end();
			})
			.pipe(template(tplOptions))
			.pipe(gulp.dest('dist'));
	}

	gulp.task('default:html', compile.bind(null, true));
	gulp.task('html:update', compile.bind(null, false));
	gulp.task('dev:after:html', function watch(cb) {
		gulp.watch(src.entry, gulp.series('default:html'));
		gulp.watch(src.template, gulp.series('html:update'));
		return cb();
	});
}