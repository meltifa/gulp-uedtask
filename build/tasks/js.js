'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (options, { gulp }) {

	gulp.task('dev:js', function () {
		return gulp.src('src/js/**/*.js').pipe((0, _gulpNewer2.default)('dist/js')).pipe(gulp.dest('dist/js'));
	});

	gulp.task('dev:after:js', function () {
		gulp.watch('src/js/**/*.js', ['dev:js']);
	});

	gulp.task('build:before:js', function () {
		return (0, _del2.default)('dist/js/**');
	});

	gulp.task('build:js', function () {
		return gulp.src('src/js/**/*.js').pipe((0, _gulpNewer2.default)('dist/js')).pipe((0, _gulpIf2.default)(({ path }) => !/\.min\.js$/i.test(path), (0, _gulpUglify2.default)())).pipe(gulp.dest('dist/js'));
	});
};

var _gulpUglify = require('gulp-uglify');

var _gulpUglify2 = _interopRequireDefault(_gulpUglify);

var _gulpIf = require('gulp-if');

var _gulpIf2 = _interopRequireDefault(_gulpIf);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _gulpNewer = require('gulp-newer');

var _gulpNewer2 = _interopRequireDefault(_gulpNewer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }