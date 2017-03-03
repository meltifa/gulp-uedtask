'use strict';

import browserSync from 'browser-sync';

export default function(options, { gulp, TaskListener }) {

	gulp.task('dev:after:browser', function() {
		let instance;
		return new Promise(function(resolve) {
			instance = browserSync.init({
				server: {
					baseDir: 'dist',
					directory: true,
					middleware(req, res, next) {
						res.setHeader('Access-Control-Allow-Origin', '*');
						next();
					}
				},
				open: 'external',
				ghostMode: false
			}, resolve);
		}).then(function() {
			TaskListener.subscribe('end', instance.reload);
		});
	});

}