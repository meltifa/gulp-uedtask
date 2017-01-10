'use strict';

import del from 'del';
import runSequence from 'run-sequence';
// import cache from 'gulp-cache';

export default function(gulp) {

	// function clearCache() {
	// 	return new Promise(function(resolve) {
	// 		return cache.clearAll(resolve);
	// 	});
	// }

	gulp.task('build:clear_dist', function() {
		return del('dist/**')//.then(clearCache);
	});

	gulp.task('build:clear_temp', function() {
		return del('.temp/**')//.then(clearCache);
	});

	gulp.task('build', function(cb) {
		runSequence('build:clear_dist', 'default', 'build:clear_temp', cb);
	});

}