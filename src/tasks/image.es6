'use strict';

import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import mozjpeg from 'imagemin-mozjpeg';
import gulpif from 'gulp-if';

export function createImagemin() {
	return imagemin({
		use: [
			mozjpeg({quality: 80}),
			pngquant()
		]
	});
}

export default function(gulp, options, { browser, isBuild }) {
	gulp.task('default:image', function() {
		return new Promise(function(resolve, reject) {
			return setTimeout(function() {
				return gulp.src('src/{img,images}/**/*.{jpg,png,gif}')
					.pipe(gulpif(
						({ path }) => !/\.min\.(jpg|png|gif)$/i.test(path),
						createImagemin()
					))
					.pipe(gulp.dest('dist'))
					.on('end', resolve)
					.on('error', reject)
					.on('end', browser.reload);
			}, 500);
		});
	});

	if(!isBuild) {
		gulp.watch('src/{img,images}/**/*.{jpg,png,gif}', ['default:image']);
	}

}