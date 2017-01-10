'use strict';

import { Font } from 'fonteditor-core';
import fs from 'fs';
import path from 'path';
import { mkdirSync } from '../utils';

const FONT_TYPES = ['ttf', 'woff', 'eot', 'svg'];

class FontCreator {

	static getCharCodeList(text) {
		if('string' !== typeof text) {
			return [];
		}
		return text.split('').reduce(function(box, word) {
			const char = word.trim();
			if(char) {
				const charCode = word.charCodeAt();
				if(0 > box.indexOf(charCode)) {
					box.push(charCode);
				}
			}
			return box;
		}, []);
	}

	constructor({ buffer, type, family, word }) {
		const font = Font.create(buffer, {
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
		font.set(fontObject);

		this.font = font;
	}

	to(type) {
		if(0 > FONT_TYPES.indexOf(type)) {
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
	const readText = new Promise(function(resolve, reject) {
		return fs.readFile(textFile, function(e, buffer) {
			return e ? reject(e) : resolve(buffer.toString());
		});
	});

	const readFont = new Promise(function(resolve, reject) {
		return fs.readFile(fontFile, function(e, buffer) {
			return e ? reject(e) : resolve(buffer);
		});
	});

	return Promise.all([readText, readFont]).then(function([ word, buffer ]) {
		const creator = new FontCreator({ word, buffer, family, type });
		const font = FONT_TYPES.reduce(function(box, extname) {
			box[extname] = creator.to(extname);
			return box;
		}, {});
		return { family, font };
	});
}

export default function(gulp, options, { browser, isBuild }) {

	const baseDir = 'src/asset/webfont/';

	gulp.task('default:webfont', function() {
		try {
			// { family: { text, font, family } }
			// 读取文件夹，记录资源的文本文件、字体文件、字体名称
			const srcs = fs.readdirSync(baseDir).reduce(function(box, file) {
				const filePath = baseDir + file;
				if(fs.lstatSync(filePath).isFile()) {
					const { ext, name: family } = path.parse(file);
					// 忽略 “_” 开头的文件
					if(0 !== family.indexOf('_')) {
						const type = ext.substring(1).toLowerCase();
						const logger = box[family] || ( box[family] = { family } );
						if('html' === type) {
							logger.textFile = filePath;
						} else if(-1 < FONT_TYPES.indexOf(type)) {
							logger.type = type;
							logger.fontFile = filePath;
						}
					}
				}
				return box;
			}, Object.create(null));

			// [ { family, font: { ttf: <ttfBuffer> } } ]
			// 遍历记录
			return Promise.all(Object.keys(srcs).reduce(function(box, key) {
				const logger = srcs[key];
				if(logger.textFile && logger.fontFile) {
					box.push(createPromise(logger));
				}
				return box;
			}, [])).then(function(webfont) {

				mkdirSync('dist/font');

				return Promise.all(webfont.map(function({ family, font }) {
					return Promise.all(Object.keys(font).map(function(ext) {
						return new Promise(function(resolve, reject) {
							return fs.writeFile('dist/font/' + family + '.' + ext, font[ext], function(e) {
								return e ? reject(e) : resolve();
							});
						});
					}));
				}));
			}).then(function() {
				return browser.reload();
			});
		} catch(e) {
			return Promise.resolve();
		}
	});

	if(!isBuild) {
		gulp.watch('src/asset/webfont/*', ['default:webfont']);
	}

}