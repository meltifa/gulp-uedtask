'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

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

exports.default = webfont;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _fonteditorCore = require('fonteditor-core');

var _util = require('util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var readFile = (0, _util.promisify)(_fs2.default.readFile);
var writeFile = (0, _util.promisify)(_fs2.default.writeFile);

var writableTypes = ['ttf', 'woff', 'eot', 'svg'];
var readableTypes = writableTypes.slice().concat('otf');

var FontCreator = function () {
	(0, _createClass3.default)(FontCreator, null, [{
		key: 'getCharCodeList',
		value: function getCharCodeList(text) {
			if (typeof text !== 'string') {
				return [];
			}
			return text.split('').reduce(function collect(box, word) {
				var char = word.trim();
				if (char) {
					var charCode = word.charCodeAt();
					if (box.indexOf(charCode) < 0) {
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
			if (writableTypes.indexOf(type) < 0) {
				throw new Error('Cannot convert to the `' + type + '` type!');
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

	var readText = readFile(textFile, { encoding: 'utf8' });
	var readFont = readFile(fontFile);
	return _promise2.default.all([readText, readFont]).then(function (_ref3) {
		var _ref4 = (0, _slicedToArray3.default)(_ref3, 2),
		    word = _ref4[0],
		    buffer = _ref4[1];

		var creator = new FontCreator({ word: word, buffer: buffer, family: family, type: type });
		var font = writableTypes.reduce(function (box, extname) {
			return (0, _defineProperty2.default)(box, extname, {
				value: creator.to(extname),
				enumerable: true
			});
		}, {});
		return { family: family, font: font };
	});
}

function webfont(gulp) {
	var baseDir = 'src/asset/webfont/';

	gulp.task('default:webfont', function compile(cb) {
		if (!_fs2.default.existsSync(baseDir)) {
			return cb();
		}
		// { family: { text, font, family } }
		// 读取文件夹，记录资源的文本文件、字体文件、字体名称
		var srcs = _fs2.default.readdirSync(baseDir).reduce(function (_box, file) {
			var box = _box;
			var filePath = baseDir + file;
			if (_fs2.default.lstatSync(filePath).isFile()) {
				var _path$parse = _path2.default.parse(file),
				    ext = _path$parse.ext,
				    family = _path$parse.name;
				// 忽略 “_” 开头的文件


				if (family.indexOf('_') !== 0) {
					var type = ext.substring(1).toLowerCase();
					var logger = box[family] || (box[family] = { family: family });
					if (type === 'html') {
						logger.textFile = filePath;
					} else if (readableTypes.indexOf(type) > -1) {
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
		}, [])).then(function (fonts) {
			_mkdirp2.default.sync('dist/font');
			return _promise2.default.all(fonts.map(function eachFont(_ref5) {
				var family = _ref5.family,
				    font = _ref5.font;

				return _promise2.default.all((0, _keys2.default)(font).map(function eachType(ext) {
					return writeFile('dist/font/' + family + '.' + ext, font[ext]);
				}));
			}));
		});
	});

	gulp.task('dev:after:webfont', function watch(cb) {
		gulp.watch('src/asset/webfont/*', gulp.series('default:webfont'));
		return cb();
	});
}