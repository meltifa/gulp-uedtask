import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import { Font } from 'fonteditor-core';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const writableTypes = ['ttf', 'woff', 'eot', 'svg'];
const readableTypes = writableTypes.slice().concat('otf');

class FontCreator {
	static getCharCodeList(text) {
		if (typeof text !== 'string') {
			return [];
		}
		return text.split('').reduce(function collect(box, word) {
			const char = word.trim();
			if (char) {
				const charCode = word.charCodeAt();
				if (box.indexOf(charCode) < 0) {
					box.push(charCode);
				}
			}
			return box;
		}, []);
	}

	constructor({ buffer, type, family, word }) {
		const font = Font.create(buffer, {
			type,
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
		if (writableTypes.indexOf(type) < 0) {
			throw new Error(`Cannot convert to the \`${type}\` type!`);
		}
		return this.font.write({
			type,
			hinting: true,
			deflate: null
		});
	}
}

function createPromise({ textFile, fontFile, family, type }) {
	const readText = readFile(textFile, { encoding: 'utf8' });
	const readFont = readFile(fontFile);
	return Promise.all([readText, readFont]).then(([word, buffer]) => {
		const creator = new FontCreator({ word, buffer, family, type });
		const font = writableTypes.reduce((box, extname) => Object.defineProperty(box, extname, {
			value: creator.to(extname),
			enumerable: true
		}), {});
		return { family, font };
	});
}


export default function webfont(gulp) {
	const baseDir = 'src/asset/webfont/';

	gulp.task('default:webfont', function compile(cb) {
		if (!fs.existsSync(baseDir)) {
			return cb();
		}
		// { family: { text, font, family } }
		// 读取文件夹，记录资源的文本文件、字体文件、字体名称
		const srcs = fs.readdirSync(baseDir).reduce((_box, file) => {
			const box = _box;
			const filePath = baseDir + file;
			if (fs.lstatSync(filePath).isFile()) {
				const { ext, name: family } = path.parse(file);
				// 忽略 “_” 开头的文件
				if (family.indexOf('_') !== 0) {
					const type = ext.substring(1).toLowerCase();
					const logger = box[family] || (box[family] = { family });
					if (type === 'html') {
						logger.textFile = filePath;
					} else if (readableTypes.indexOf(type) > -1) {
						logger.type = type;
						logger.fontFile = filePath;
					}
				}
			}
			return box;
		}, Object.create(null));

		// [ { family, font: { ttf: <ttfBuffer> } } ]
		// 遍历记录
		return Promise.all(Object.keys(srcs).reduce((box, key) => {
			const logger = srcs[key];
			if (logger.textFile && logger.fontFile) {
				box.push(createPromise(logger));
			}
			return box;
		}, [])).then((fonts) => {
			mkdirp.sync('dist/font');
			return Promise.all(fonts.map(function eachFont({ family, font }) {
				return Promise.all(Object.keys(font).map(function eachType(ext) {
					return writeFile(`dist/font/${family}.${ext}`, font[ext]);
				}));
			}));
		});
	});

	gulp.task('dev:after:webfont', function watch(cb) {
		gulp.watch('src/asset/webfont/*', gulp.series('default:webfont'));
		return cb();
	});
}