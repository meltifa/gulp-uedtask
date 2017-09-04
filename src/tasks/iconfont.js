'use strict';

import generator from 'gulp-iconfont';
import path from 'path';
import fs from 'fs';
import { mkdirSync } from '../utils';
import del from 'del';

const iconPath = process.cwd() + '/src/asset/iconfont/';
const unicodeRE = /^u([A-Z0-9]{4})-/;

function getSvgs() {
	return fs.readdirSync(iconPath).filter(file => /\.svg$/i.test(file));
}

function getMaxUnicode() {
	let max = 59904;
	getSvgs().forEach(function(svg) {
		const exec = unicodeRE.exec(svg);
		if(exec) {
			const index = parseInt(exec[1], 16);
			if(index > max) {
				max = index;
			}
		}
	});
	return max;
}

function renameSvgs() {
	let begin = getMaxUnicode() + 1;
	getSvgs().forEach(function(svg) {
		if(unicodeRE.test(svg)) {
			return;
		}
		const newPath = iconPath + 'u' + begin.toString(16).toUpperCase() + '-' + svg;
		fs.renameSync(iconPath + svg, newPath);
		begin++;
	});
	return true;
}

export default function(options, { gulp }) {

	gulp.task('default:iconfont', function() {
		try {
			fs.accessSync(iconPath, fs.hasOwnProperty('R_OK') ? fs.R_OK : fs.constants.R_OK);
		} catch(e) {
			return Promise.resolve();
		}

		renameSvgs();
		return gulp.src('src/asset/iconfont/*.svg')
			.pipe(generator({
				fontName: 'iconfont',
				formats: ['svg', 'ttf', 'eot', 'woff'],
				prependUnicode: true,
				normalize: true,
				fontHeight: 1001
			}))
			.on('glyphs', function(glyphs) {
				const pathname = path.resolve(__dirname, '../../static/_iconfont.scss');
				const icons = glyphs.reduce(function(iconfont, glyph) {
					return Object.defineProperty(iconfont, glyph.name, {
						value: `\\${glyph.unicode[0].charCodeAt(0).toString(16).toLowerCase()}`,
						enumerable: true
					});
				}, {});
				mkdirSync('src/css');
				const content = [
					'$__iconfont__data: ' + JSON.stringify(icons, null, '\t').replace(/\{/g, '(').replace(/\}/g, ')').replace(/\\\\/g, '\\') + ';',
					fs.readFileSync(pathname).toString()
				].join('\n\n');
				fs.writeFileSync('src/css/_iconfont.scss', content);
			})
			.pipe(gulp.dest('dist/font'));
	});

	gulp.task('dev:after:iconfont', function(){
		gulp.watch('src/asset/iconfont/*.svg', ['default:iconfont']);
	});

	gulp.task('build:before:iconfont', function() {
		return del('dist/font/iconfont.*');
	});

	
}