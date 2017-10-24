'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = js;

var _webpackStream = require('webpack-stream');

var _webpackStream2 = _interopRequireDefault(_webpackStream);

var _gulpBabel = require('gulp-babel');

var _gulpBabel2 = _interopRequireDefault(_gulpBabel);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 所有配置类同 image 任务

const babelConfig = {
	presets: [['env', {
		targets: {
			browsers: ['last 2 versions', 'ie >= 8']
		},
		modules: false,
		useBuiltIns: true
	}]],
	ignore: ['lib', '*.min.js']
};
const isUsingWebpack = _fs2.default.existsSync('./webpack.config.js', result => result);
let webpackConfig;
if (isUsingWebpack) {
	webpackConfig = require(_path2.default.join(process.cwd(), './webpack.config.js'));
}

function js(gulp) {
	const { config } = this;
	const src = 'src/js/**/*.js';
	if (config.minifyJS !== false) {
		babelConfig.presets.push(['minify']);
	}

	gulp.task('dev:after:js', function watch(cb) {
		this.reload(src);
		cb();
	});

	gulp.task('build:js', function compile() {
		let stream = gulp.src(src);
		if (isUsingWebpack) {
			stream = stream.pipe((0, _webpackStream2.default)(webpackConfig));
		}
		return stream.pipe((0, _gulpBabel2.default)(babelConfig)).pipe(gulp.dest('dist/js'));
	});
}