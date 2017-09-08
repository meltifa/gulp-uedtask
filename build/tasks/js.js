'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = js;

var _gulpUglify = require('gulp-uglify');

var _gulpUglify2 = _interopRequireDefault(_gulpUglify);

var _gulpIf = require('gulp-if');

var _gulpIf2 = _interopRequireDefault(_gulpIf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 所有配置类同 image 任务

function js(gulp) {
	var config = this.config;

	var src = 'src/js/**/*.js';

	function isCompress(_ref) {
		var path = _ref.path;

		return !(/\.min\.js$/i.test(path) || config.minifyJS === false);
	}

	gulp.task('dev:after:js', function watch(cb) {
		this.reload(src);
		cb();
	});

	gulp.task('build:js', function compile() {
		return gulp.src(src).pipe((0, _gulpIf2.default)(isCompress, (0, _gulpUglify2.default)())).pipe(gulp.dest('dist/js'));
	});
}