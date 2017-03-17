'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (_ref, _ref2) {
	var port = _ref.port;
	var gulp = _ref2.gulp,
	    TaskListener = _ref2.TaskListener;


	var bsPort = port ? 'number' === typeof port ? port : Math.floor(9999 * Math.random()) : false;

	gulp.task('dev:after:browser', function () {
		var bs = _browserSync2.default.create();

		return new Promise(function (resolve) {
			var config = {
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
			};
			if (bsPort) {
				config.port = bsPort;
			}
			return bs.init(config, resolve);
		}).then(function () {
			TaskListener.subscribe('end', bs.reload);
		});
	});
};

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }