'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.createImagemin = createImagemin;

exports.default = function (options, _ref) {
	var gulp = _ref.gulp;

	gulp.task('default:image', function () {
		return new _promise2.default(function (resolve, reject) {
			return setTimeout(function () {
				return gulp.src('src/{img,images}/**/*.{jpg,png,gif}').pipe((0, _gulpIf2.default)(function (_ref2) {
					var path = _ref2.path;
					return !/\.min\.(jpg|png|gif)$/i.test(path);
				}, createImagemin())).pipe(gulp.dest('dist')).on('end', resolve).on('error', reject);
			}, 500);
		});
	});

	gulp.task('build:before:image', function () {
		return (0, _del2.default)(['dist/img/**', 'dist/images/**']);
	});

	gulp.task('dev:after:image', function () {
		gulp.watch('src/{img,images}/**/*.{jpg,png,gif}', ['default:image']);
	});
};

var _gulpImagemin = require('gulp-imagemin');

var _gulpImagemin2 = _interopRequireDefault(_gulpImagemin);

var _imageminPngquant = require('imagemin-pngquant');

var _imageminPngquant2 = _interopRequireDefault(_imageminPngquant);

var _imageminMozjpeg = require('imagemin-mozjpeg');

var _imageminMozjpeg2 = _interopRequireDefault(_imageminMozjpeg);

var _gulpIf = require('gulp-if');

var _gulpIf2 = _interopRequireDefault(_gulpIf);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createImagemin() {
	return (0, _gulpImagemin2.default)({
		use: [(0, _imageminMozjpeg2.default)({ quality: 80 }), (0, _imageminPngquant2.default)()]
	});
}