'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = html;

var _gulpNewer = require('gulp-newer');

var _gulpNewer2 = _interopRequireDefault(_gulpNewer);

var _juicer = require('juicer');

var _juicer2 = _interopRequireDefault(_juicer);

var _gulpHtmlTpl = require('gulp-html-tpl');

var _gulpHtmlTpl2 = _interopRequireDefault(_gulpHtmlTpl);

var _gulpFileInclude = require('gulp-file-include');

var _gulpFileInclude2 = _interopRequireDefault(_gulpFileInclude);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Juicer 默认会清除换行等空白
// 导致模板内的 JavaScript 错误
// 因此必须关闭
_juicer2.default.set('strip', false);

const src = {
	// 入口文件
	entry: ['src/**/*.html', '!src/**/_*.html', '!src/{asset,template,inc}/**/*.html'],
	// 模板文件
	template: ['src/**/_*.html', 'src/{template,inc}/**/*.html']
};

function html(gulp) {
	const { emit } = this;

	// 模板配置
	const tplOptions = {
		engine: _juicer2.default,
		dataTag: 'data',
		data: { Math, Number, Boolean, String, Array, Object, JSON, RegExp, Date },
		log: msg => emit('log', {
			title: 'Template render error',
			content: msg
		})
	};

	function compile(isNewer) {
		let stream = gulp.src(src.entry);
		// 根据是否需要加载 newer 分支
		// 更新模板文件的时候不加载 newer
		// 入口文件变动的时候加载
		if (isNewer) {
			stream = stream.pipe((0, _gulpNewer2.default)('dist'));
		}
		return stream.pipe((0, _gulpFileInclude2.default)()).on('error', function log(err) {
			emit('log', `fileIncluder Error!\n${err.message}`);
			this.end();
		}).pipe((0, _gulpHtmlTpl2.default)(tplOptions)).pipe(gulp.dest('dist'));
	}

	gulp.task('default:html', compile.bind(null, true));
	gulp.task('html:update', compile.bind(null, false));
	gulp.task('dev:after:html', function watch(cb) {
		gulp.watch(src.entry, gulp.series('default:html'));
		gulp.watch(src.template, gulp.series('html:update'));
		return cb();
	});
}