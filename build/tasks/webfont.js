'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = function (options, _ref5) {
	var gulp = _ref5.gulp;


	var baseDir = 'src/asset/webfont/';

	gulp.task('default:webfont', function () {
		try {
			_fs2.default.accessSync(baseDir, _fs2.default.hasOwnProperty('R_OK') ? _fs2.default.R_OK : _fs2.default.constants.R_OK);
		} catch (e) {
			return Promise.resolve();
		}

		// { family: { text, font, family } }
		// 读取文件夹，记录资源的文本文件、字体文件、字体名称
		var srcs = _fs2.default.readdirSync(baseDir).reduce(function (box, file) {
			var filePath = baseDir + file;
			if (_fs2.default.lstatSync(filePath).isFile()) {
				var _path$parse = _path2.default.parse(file),
				    ext = _path$parse.ext,
				    family = _path$parse.name;
				// 忽略 “_” 开头的文件


				if (0 !== family.indexOf('_')) {
					var type = ext.substring(1).toLowerCase();
					var logger = box[family] || (box[family] = { family: family });
					if ('html' === type) {
						logger.textFile = filePath;
					} else if (-1 < FONT_TYPES.indexOf(type)) {
						logger.type = type;
						logger.fontFile = filePath;
					}
				}
			}
			return box;
		}, Object.create(null));

		// [ { family, font: { ttf: <ttfBuffer> } } ]
		// 遍历记录
		return Promise.all(Object.keys(srcs).reduce(function (box, key) {
			var logger = srcs[key];
			if (logger.textFile && logger.fontFile) {
				box.push(createPromise(logger));
			}
			return box;
		}, [])).then(function (webfont) {

			(0, _utils.mkdirSync)('dist/font');

			return Promise.all(webfont.map(function (_ref6) {
				var family = _ref6.family,
				    font = _ref6.font;

				return Promise.all(Object.keys(font).map(function (ext) {
					return new Promise(function (resolve, reject) {
						return _fs2.default.writeFile('dist/font/' + family + '.' + ext, font[ext], function (e) {
							return e ? reject(e) : resolve();
						});
					});
				}));
			}));
		});
	});

	gulp.task('dev:after:webfont', function () {
		gulp.watch('src/asset/webfont/*', ['default:webfont']);
	});

	gulp.task('build:before:webfont', function () {
		return (0, _del2.default)(['dist/font/**', '!dist/font', '!dist/font/iconfont.*']);
	});
};

var _fonteditorCore = require('fonteditor-core');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('../utils');

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FONT_TYPES = ['ttf', 'woff', 'eot', 'svg'];

var FontCreator = function () {
	_createClass(FontCreator, null, [{
		key: 'getCharCodeList',
		value: function getCharCodeList(text) {
			if ('string' !== typeof text) {
				return [];
			}
			return text.split('').reduce(function (box, word) {
				var char = word.trim();
				if (char) {
					var charCode = word.charCodeAt();
					if (0 > box.indexOf(charCode)) {
						box.push(charCode);
					}
				}
				return box;
			}, []);
		}
	}]);

	function FontCreator(_ref) {
		var buffer = _ref.buffer,
		    type = _ref.type,
		    family = _ref.family,
		    word = _ref.word;

		_classCallCheck(this, FontCreator);

		var font = _fonteditorCore.Font.create(buffer, {
			type: type,
			hinting: true,
			compound2simple: true,
			subset: FontCreator.getCharCodeList(word),
			inflate: null,
			combinePath: false
		});
		var fontObject = font.get();
		Object.assign(fontObject.name, {
			fontFamily: family,
			fontSubFamily: family,
			uniqueSubFamily: family,
			fullName: family,
			postScriptName: family,
			preferredFamily: family,
			version: 'Version 1.000'
		});
		fontObject['OS/2'].bProportion = 0;
		font.set(fontObject);

		this.font = font;
	}

	_createClass(FontCreator, [{
		key: 'to',
		value: function to(type) {
			if (0 > FONT_TYPES.indexOf(type)) {
				throw new Error('Cannot convert to the specified type!');
			}
			return this.font.write({
				type: type,
				hinting: true,
				deflate: null
			});
		}
	}]);

	return FontCreator;
}();

function createPromise(_ref2) {
	var textFile = _ref2.textFile,
	    fontFile = _ref2.fontFile,
	    family = _ref2.family,
	    type = _ref2.type;

	var readText = new Promise(function (resolve, reject) {
		return _fs2.default.readFile(textFile, function (e, buffer) {
			return e ? reject(e) : resolve(buffer.toString());
		});
	});

	var readFont = new Promise(function (resolve, reject) {
		return _fs2.default.readFile(fontFile, function (e, buffer) {
			return e ? reject(e) : resolve(buffer);
		});
	});

	return Promise.all([readText, readFont]).then(function (_ref3) {
		var _ref4 = _slicedToArray(_ref3, 2),
		    word = _ref4[0],
		    buffer = _ref4[1];

		var creator = new FontCreator({ word: word, buffer: buffer, family: family, type: type });
		var font = FONT_TYPES.reduce(function (box, extname) {
			box[extname] = creator.to(extname);
			return box;
		}, {});
		return { family: family, font: font };
	});
}