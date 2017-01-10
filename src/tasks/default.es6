'use strict';

export default function(gulp, options, { browser, taskNames, defaultEndCb, isBuild }) {

	const initBlackList = ['default:css'];
	const dependencies = taskNames.filter(function(name) {
		return /^default:/.test(name) && 0 > initBlackList.indexOf(name);
	});

	gulp.task('default', dependencies, function() {
		if(isBuild) {
			return Promise.all(defaultEndCb.map(cb => cb()));
		}
		return new Promise(function(resolve) {
			return browser.init({
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
			return Promise.all(defaultEndCb.map(cb => cb()));
		});
	});

}