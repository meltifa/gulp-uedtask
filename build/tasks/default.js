'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (gulp, options, _ref) {
	var browser = _ref.browser,
	    taskNames = _ref.taskNames,
	    defaultEndCb = _ref.defaultEndCb,
	    isBuild = _ref.isBuild;


	var initBlackList = ['default:css'];
	var dependencies = taskNames.filter(function (name) {
		return (/^default:/.test(name) && 0 > initBlackList.indexOf(name)
		);
	});

	gulp.task('default', dependencies, function () {
		if (isBuild) {
			return Promise.all(defaultEndCb.map(function (cb) {
				return cb();
			}));
		}
		return new Promise(function (resolve) {
			return browser.init({
				server: {
					baseDir: 'dist',
					directory: true,
					middleware: function middleware(req, res, next) {
						res.setHeader('Access-Control-Allow-Origin', '*');
						next();
					}
				},
				open: 'external',
				ghostMode: false
			}, resolve);
		}).then(function () {
			return Promise.all(defaultEndCb.map(function (cb) {
				return cb();
			}));
		});
	});
};