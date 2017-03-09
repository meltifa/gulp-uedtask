'use strict';

import uglify from 'gulp-uglify';
import gulpif from 'gulp-if';
import del from 'del';

export default function(options, { gulp }) {

	gulp.task('default:js', function() {
		return gulp.src('src/js/**/*.js')
			.pipe(gulpif(
				({ path }) => !/\.min\.js$/i.test(path),
				uglify()
			))
			.pipe(gulp.dest('dist/js'));
	});

	gulp.task('dev:after:js', function() {
		gulp.watch('src/js/**/*.js', ['default:js']);
	});

	gulp.task('build:before:js', function() {
		return del('dist/js/**');
	})

}