'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (gulp) {

	// function clearCache() {
	// 	return new Promise(function(resolve) {
	// 		return cache.clearAll(resolve);
	// 	});
	// }

	gulp.task('build:clear_dist', function () {
		return (0, _del2.default)('dist/**'); //.then(clearCache);
	});

	gulp.task('build:clear_temp', function () {
		return (0, _del2.default)('.temp/**'); //.then(clearCache);
	});

	gulp.task('build', function (cb) {
		(0, _runSequence2.default)('build:clear_dist', 'default', 'build:clear_temp', cb);
	});
};

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _runSequence = require('run-sequence');

var _runSequence2 = _interopRequireDefault(_runSequence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }