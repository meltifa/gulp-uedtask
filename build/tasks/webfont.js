'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (options, { gulp }) {

	const baseDir = 'src/asset/webfont/';

	gulp.task('default:webfont', function () {
		try {
			_fs2.default.accessSync(baseDir, _fs2.default.hasOwnProperty('R_OK') ? _fs2.default.R_OK : _fs2.default.constants.R_OK);
		} catch (e) {
			return Promise.resolve();
		}

		// { family: { text, font, family } }
		// 读取文件夹，记录资源的文本文件、字体文件、字体名称
		const srcs = _fs2.default.readdirSync(baseDir).reduce(function (box, file) {
			const filePath = baseDir + file;
			if (_fs2.default.lstatSync(filePath).isFile()) {
				const { ext, name: family } = _path2.default.parse(file);
				// 忽略 “_” 开头的文件
				if (0 !== family.indexOf('_')) {
					const type = ext.substring(1).toLowerCase();
					const logger = box[family] || (box[family] = { family });
					if ('html' === type) {
						logger.textFile = filePath;
					} else if (-1 < readableTypes.indexOf(type)) {
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
			const logger = srcs[key];
			if (logger.textFile && logger.fontFile) {
				box.push(createPromise(logger));
			}
			return box;
		}, [])).then(function (webfont) {

			(0, _utils.mkdirSync)('dist/font');

			return Promise.all(webfont.map(function ({ family, font }) {
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

const writableTypes = ['ttf', 'woff', 'eot', 'svg'];
const readableTypes = writableTypes.slice().concat('otf');

class FontCreator {

	static getCharCodeList(text) {
		if ('string' !== typeof text) {
			return [];
		}
		return text.split('').reduce(function (box, word) {
			const char = word.trim();
			if (char) {
				const charCode = word.charCodeAt();
				if (0 > box.indexOf(charCode)) {
					box.push(charCode);
				}
			}
			return box;
		}, []);
	}

	constructor({ buffer, type, family, word }) {
		const font = _fonteditorCore.Font.create(buffer, {
			type: type,
			hinting: true,
			compound2simple: true,
			subset: FontCreator.getCharCodeList(word),
			inflate: null,
			combinePath: false
		});
		const fontObject = font.get();
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

	to(type) {
		if (0 > writableTypes.indexOf(type)) {
			throw new Error('Cannot convert to the specified type!');
		}
		return this.font.write({
			type: type,
			hinting: true,
			deflate: null
		});
	}

}

function createPromise({ textFile, fontFile, family, type }) {
	const readText = new Promise(function (resolve, reject) {
		return _fs2.default.readFile(textFile, function (e, buffer) {
			return e ? reject(e) : resolve(buffer.toString());
		});
	});

	const readFont = new Promise(function (resolve, reject) {
		return _fs2.default.readFile(fontFile, function (e, buffer) {
			return e ? reject(e) : resolve(buffer);
		});
	});

	return Promise.all([readText, readFont]).then(function ([word, buffer]) {
		const creator = new FontCreator({ word, buffer, family, type });
		const font = writableTypes.reduce(function (box, extname) {
			box[extname] = creator.to(extname);
			return box;
		}, {});
		return { family, font };
	});
}