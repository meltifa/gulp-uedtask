'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.createImagemin = createImagemin;

exports.default = function (gulp, options, _ref) {
	var browser = _ref.browser,
	    isBuild = _ref.isBuild;

	gulp.task('default:image', function () {
		return new Promise(function (resolve, reject) {
			return setTimeout(function () {
				return gulp.src('src/{img,images}/**/*.{jpg,png,gif}').pipe((0, _gulpIf2.default)(function (_ref2) {
					var path = _ref2.path;
					return !/\.min\.(jpg|png|gif)$/i.test(path);
				}, createImagemin())).pipe(gulp.dest('dist')).on('end', resolve).on('error', reject).on('end', browser.reload);
			}, 500);
		});
	});

	if (!isBuild) {
		gulp.watch('src/{img,images}/**/*.{jpg,png,gif}', ['default:image']);
	}
};

var _gulpImagemin = require('gulp-imagemin');

var _gulpImagemin2 = _interopRequireDefault(_gulpImagemin);

var _imageminPngquant = require('imagemin-pngquant');

var _imageminPngquant2 = _interopRequireDefault(_imageminPngquant);

var _imageminMozjpeg = require('imagemin-mozjpeg');

var _imageminMozjpeg2 = _interopRequireDefault(_imageminMozjpeg);

var _gulpIf = require('gulp-if');

var _gulpIf2 = _interopRequireDefault(_gulpIf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createImagemin() {
	return (0, _gulpImagemin2.default)({
		use: [(0, _imageminMozjpeg2.default)({ quality: 80 }), (0, _imageminPngquant2.default)()]
	});
}