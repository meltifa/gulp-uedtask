'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = image;

var _gulpImagemin = require('gulp-imagemin');

var _gulpImagemin2 = _interopRequireDefault(_gulpImagemin);

var _imageminPngquant = require('imagemin-pngquant');

var _imageminPngquant2 = _interopRequireDefault(_imageminPngquant);

var _imageminMozjpeg = require('imagemin-mozjpeg');

var _imageminMozjpeg2 = _interopRequireDefault(_imageminMozjpeg);

var _gulpIf = require('gulp-if');

var _gulpIf2 = _interopRequireDefault(_gulpIf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 带 `.min` 后缀的文件不压缩
function isCompress({ path }) {
	return !/\.min\.(jpg|png|gif)$/i.test(path);
}

function image(gulp) {
	const src = 'src/{img,images}/**/*.{jpg,png,gif}';

	// 只在 build 阶段压缩
	gulp.task('build:image', function compress() {
		return gulp.src(src).pipe((0, _gulpIf2.default)(isCompress, (0, _gulpImagemin2.default)({
			use: [(0, _imageminMozjpeg2.default)({ quality: 80 }), (0, _imageminPngquant2.default)()]
		}))).pipe(gulp.dest('dist'));
	});

	// dev 阶段图片的预览通过 browser-sync 代理完成
	// 这里只需要监听 src 目录图片来刷新浏览器即可
	gulp.task('dev:after:image', function watch(cb) {
		this.reload(src);
		return cb();
	});
}