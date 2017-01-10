'use strict';

import uglify from 'gulp-uglify';

export default function(gulp, options, { browser, isBuild }) {

	gulp.task('default:js:compress', function() {
		return gulp.src(['src/js/**/*.js', '!src/js/**/*.min.js'])
			.pipe(uglify())
			.pipe(gulp.dest('dist/js'));
	});

	gulp.task('default:js', ['default:js:compress'], function() {
		return gulp.src('src/js/**/*.min.js')
			.pipe(gulp.dest('dist/js'))
			.on('end', browser.reload);
	})

	if(!isBuild) {
		gulp.watch('src/js/**/*.js', ['default:js']);		
	}

}