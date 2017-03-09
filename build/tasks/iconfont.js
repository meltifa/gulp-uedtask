'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (options, _ref) {
	var gulp = _ref.gulp;


	gulp.task('default:iconfont', function () {
		try {
			_fs2.default.accessSync(iconPath, _fs2.default.hasOwnProperty('R_OK') ? _fs2.default.R_OK : _fs2.default.constants.R_OK);
		} catch (e) {
			return Promise.resolve();
		}

		renameSvgs();
		return gulp.src('src/asset/iconfont/*.svg').pipe((0, _gulpIconfont2.default)({
			fontName: 'iconfont',
			formats: ['svg', 'ttf', 'eot', 'woff'],
			prependUnicode: true,
			normalize: true
		})).on('glyphs', function (glyphs) {
			var pathname = _path2.default.resolve(__dirname, '../../static/_iconfont.scss');
			var icons = glyphs.reduce(function (iconfont, glyph) {
				return Object.defineProperty(iconfont, glyph.name, {
					value: '\\' + glyph.unicode[0].charCodeAt(0).toString(16).toLowerCase(),
					enumerable: true
				});
			}, {});
			(0, _utils.mkdirSync)('src/css');
			var content = ['$__iconfont__data: ' + JSON.stringify(icons, null, '\t').replace(/\{/g, '(').replace(/\}/g, ')').replace(/\\\\/g, '\\') + ';', _fs2.default.readFileSync(pathname).toString()].join('\n\n');
			_fs2.default.writeFileSync('src/css/_iconfont.scss', content);
		}).pipe(gulp.dest('dist/font'));
	});

	gulp.task('dev:after:iconfont', function () {
		gulp.watch('src/asset/iconfont/*.svg', ['default:iconfont']);
	});

	gulp.task('build:before:iconfont', function () {
		return (0, _del2.default)('dist/font/iconfont.*');
	});
};

var _gulpIconfont = require('gulp-iconfont');

var _gulpIconfont2 = _interopRequireDefault(_gulpIconfont);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _utils = require('../utils');

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var iconPath = process.cwd() + '/src/asset/iconfont/';
var unicodeRE = /^u([A-Z0-9]{4})-/;

function getSvgs() {
	return _fs2.default.readdirSync(iconPath).filter(function (file) {
		return (/\.svg$/i.test(file)
		);
	});
}

function getMaxUnicode() {
	var max = 59904;
	getSvgs().forEach(function (svg) {
		var exec = unicodeRE.exec(svg);
		if (exec) {
			var index = parseInt(exec[1], 16);
			if (index > max) {
				max = index;
			}
		}
	});
	return max;
}

function renameSvgs() {
	var begin = getMaxUnicode() + 1;
	getSvgs().forEach(function (svg) {
		if (unicodeRE.test(svg)) {
			return;
		}
		var newPath = iconPath + 'u' + begin.toString(16).toUpperCase() + '-' + svg;
		_fs2.default.renameSync(iconPath + svg, newPath);
		begin++;
	});
	return true;
}