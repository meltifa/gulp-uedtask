import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import mozjpeg from 'imagemin-mozjpeg';
import gulpif from 'gulp-if';

// 带 `.min` 后缀的文件不压缩
function isCompress({ path }) {
	return !/\.min\.(jpg|png|gif)$/i.test(path);
}

export default function image(gulp) {
	const src = 'src/{img,images}/**/*.{jpg,png,gif}';

	// 只在 build 阶段压缩
	gulp.task('build:image', function compress() {
		return gulp.src(src)
			.pipe(gulpif(isCompress, imagemin({
				use: [
					mozjpeg({ quality: 80 }),
					pngquant()
				]
			})))
			.pipe(gulp.dest('dist'));
	});

	// dev 阶段图片的预览通过 browser-sync 代理完成
	// 这里只需要监听 src 目录图片来刷新浏览器即可
	gulp.task('dev:after:image', function watch(cb) {
		this.reload(src);
		return cb();
	});
}