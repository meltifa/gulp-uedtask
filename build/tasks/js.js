'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (options, _ref) {
	var gulp = _ref.gulp;


	gulp.task('default:js', function () {
		return gulp.src('src/js/**/*.js').pipe((0, _gulpIf2.default)(function (_ref2) {
			var path = _ref2.path;
			return !/\.min\.js$/i.test(path);
		}, (0, _gulpUglify2.default)())).pipe(gulp.dest('dist/js'));
	});

	gulp.task('dev:after:js', function () {
		gulp.watch('src/js/**/*.js', ['default:js']);
	});

	gulp.task('build:before:js', function () {
		return (0, _del2.default)('dist/js/**');
	});
};

var _gulpUglify = require('gulp-uglify');

var _gulpUglify2 = _interopRequireDefault(_gulpUglify);

var _gulpIf = require('gulp-if');

var _gulpIf2 = _interopRequireDefault(_gulpIf);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }