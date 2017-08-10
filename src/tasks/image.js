'use strict';

import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';
import mozjpeg from 'imagemin-mozjpeg';
import gulpif from 'gulp-if';
import del from 'del';
import newer from 'gulp-newer';

export function createImagemin() {
	return imagemin({
		use: [
			mozjpeg({quality: 80}),
			pngquant()
		]
	});
}

export default function(options, { gulp }) {
	gulp.task('default:image', function() {
		return new Promise(function(resolve, reject) {
			return setTimeout(function() {
				return gulp.src('src/{img,images}/**/*.{jpg,png,gif}')
					.pipe(newer('dist'))
					.pipe(gulpif(
						({ path }) => !/\.min\.(jpg|png|gif)$/i.test(path),
						createImagemin()
					))
					.pipe(gulp.dest('dist'))
					.on('end', resolve)
					.on('error', reject);
			}, 500);
		});
	});

	gulp.task('build:before:image', function() {
		return del(['dist/img/**', 'dist/images/**']);
	});

	gulp.task('dev:after:image', function() {
		gulp.watch('src/{img,images}/**/*.{jpg,png,gif}', ['default:image']);
	});

}