'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function (options, _ref) {
	var gulp = _ref.gulp,
	    TaskListener = _ref.TaskListener;


	gulp.task('dev:after:browser', function () {
		var instance = void 0;
		return new _promise2.default(function (resolve) {
			instance = _browserSync2.default.init({
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
			TaskListener.subscribe('end', instance.reload);
		});
	});
};

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }