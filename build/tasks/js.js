'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (gulp, options, _ref) {
	var browser = _ref.browser,
	    isBuild = _ref.isBuild;


	gulp.task('default:js:compress', function () {
		return gulp.src(['src/js/**/*.js', '!src/js/**/*.min.js']).pipe((0, _gulpUglify2.default)()).pipe(gulp.dest('dist/js'));
	});

	gulp.task('default:js', ['default:js:compress'], function () {
		return gulp.src('src/js/**/*.min.js').pipe(gulp.dest('dist/js')).on('end', browser.reload);
	});

	if (!isBuild) {
		gulp.watch('src/js/**/*.js', ['default:js']);
	}
};

var _gulpUglify = require('gulp-uglify');

var _gulpUglify2 = _interopRequireDefault(_gulpUglify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }