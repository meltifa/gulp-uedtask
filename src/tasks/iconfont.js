import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import generator from 'gulp-iconfont';

const iconPath = path.resolve('src/asset/iconfont');
const unicodeRE = /^u([A-Z0-9]{4})-/;

// 返回所有SVG文件的文件名
function getSvgs() {
	return fs.readdirSync(iconPath).filter(file => /\.svg$/i.test(file));
}

// 根据现有SVG 文件的前缀获取当前已经排序的最大序列
function getMaxUnicode() {
	let max = 59904;
	getSvgs().forEach(function compare(svg) {
		if (unicodeRE.test(svg)) {
			const index = parseInt(RegExp.$1, 16);
			if (index > max) {
				max = index;
			}
		}
	});
	return max;
}

// 给还没有添加前缀的文件添加前缀
function renameSvgs() {
	let begin = getMaxUnicode();
	getSvgs().forEach(function rename(svg) {
		if (unicodeRE.test(svg)) {
			return;
		}
		begin += 1;
		const newPath = path.join(iconPath, `u${begin.toString(16).toUpperCase()}-${svg}`);
		fs.renameSync(iconPath + svg, newPath);
	});
	return true;
}

// 把对象转换成SCSS中的格式
function toSCSSObject(obj) {
	return JSON.stringify(obj, null, '\t')
		.replace(/\{/g, '(')
		.replace(/\}/g, ')')
		.replace(/\\\\/g, '\\');
}

export default function iconfont(gulp) {
	gulp.task('default:iconfont', function compile() {
		// 不存在 iconfont 的目录就无需执行下面的代码了
		if (!fs.existsSync(iconPath)) {
			return Promise.resolve();
		}
		// 先重命名新加入的文件
		renameSvgs();
		return gulp.src('src/asset/iconfont/*.svg')
			.pipe(generator({
				fontName: 'iconfont',
				formats: ['svg', 'ttf', 'eot', 'woff'],
				prependUnicode: true,
				normalize: true,
				fontHeight: 1001
			}))
			.on('glyphs', function writeSCSS(glyphs) {
				// SCSS模板
				const tplPath = path.resolve(__dirname, '../../static/_iconfont.scss');
				const template = fs.readFileSync(tplPath, { encoding: 'utf8' });
				// 生成的数据
				const icons = glyphs.reduce(function getCharCodes(fonts, glyph) {
					return Object.defineProperty(fonts, glyph.name, {
						value: `\\${glyph.unicode[0].charCodeAt(0).toString(16).toLowerCase()}`,
						enumerable: true
					});
				}, {});
				const data = `$__iconfont__data: ${toSCSSObject(icons)};`;
				// 确保文件夹存在
				mkdirp.sync('src/css');
				// 写入文件
				fs.writeFileSync('src/css/_iconfont.scss', template.concat('\n\n', data));
			})
			.pipe(gulp.dest('dist/font'));
	});

	gulp.task('dev:before:iconfont', function watch(cb) {
		gulp.watch('src/asset/iconfont/*.svg', gulp.series('default:iconfont'));
		return cb();
	});
}