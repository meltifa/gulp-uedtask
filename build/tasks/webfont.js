'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

exports.default = function (options, _ref5) {
	var gulp = _ref5.gulp;


	var baseDir = 'src/asset/webfont/';

	gulp.task('default:webfont', function () {
		try {
			_fs2.default.accessSync(baseDir, _fs2.default.hasOwnProperty('R_OK') ? _fs2.default.R_OK : _fs2.default.constants.R_OK);
		} catch (e) {
			return _promise2.default.resolve();
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
		}, (0, _create2.default)(null));

		// [ { family, font: { ttf: <ttfBuffer> } } ]
		// 遍历记录
		return _promise2.default.all((0, _keys2.default)(srcs).reduce(function (box, key) {
			var logger = srcs[key];
			if (logger.textFile && logger.fontFile) {
				box.push(createPromise(logger));
			}
			return box;
		}, [])).then(function (webfont) {

			(0, _utils.mkdirSync)('dist/font');

			return _promise2.default.all(webfont.map(function (_ref6) {
				var family = _ref6.family,
				    font = _ref6.font;

				return _promise2.default.all((0, _keys2.default)(font).map(function (ext) {
					return new _promise2.default(function (resolve, reject) {
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

var FONT_TYPES = ['ttf', 'woff', 'eot', 'svg'];

var FontCreator = function () {
	(0, _createClass3.default)(FontCreator, null, [{
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
		(0, _classCallCheck3.default)(this, FontCreator);

		var font = _fonteditorCore.Font.create(buffer, {
			type: type,
			hinting: true,
			compound2simple: true,
			subset: FontCreator.getCharCodeList(word),
			inflate: null,
			combinePath: false
		});
		var fontObject = font.get();
		(0, _assign2.default)(fontObject.name, {
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

	(0, _createClass3.default)(FontCreator, [{
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

	var readText = new _promise2.default(function (resolve, reject) {
		return _fs2.default.readFile(textFile, function (e, buffer) {
			return e ? reject(e) : resolve(buffer.toString());
		});
	});

	var readFont = new _promise2.default(function (resolve, reject) {
		return _fs2.default.readFile(fontFile, function (e, buffer) {
			return e ? reject(e) : resolve(buffer);
		});
	});

	return _promise2.default.all([readText, readFont]).then(function (_ref3) {
		var _ref4 = (0, _slicedToArray3.default)(_ref3, 2),
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