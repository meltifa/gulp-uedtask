import fs from 'fs';
import path from 'path';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';
import urleditor from 'postcss-url-editor';
import pxeditor from 'postcss-px-editor';
import Sprite from 'postcss-sprite-property';
import Library from '../../library';
import { slash } from '../utils';

// 图片文件夹名
// 先判断是否已存在，否则默认 images
function imgdir() {
	const dirs = ['images', 'img'];
	const dir = dirs.find(dirpath => fs.existsSync(path.resolve(`src/${dirpath}`)));
	return dir || dirs.shift();
}

export default function css(gulp) {
	const { config, commands, emit } = this;
	const isDevelopment = commands.indexOf('dev') > -1;

	/* 雪碧图配置 */
	const outputdir = imgdir();
	const spriteOptions = {
		path: {
			include: ['src/css', 'src/asset/sprite'],
			output: `dist/${outputdir}/sprite_[name].png`,
			public({ input }) {
				const parse = path.parse(input);
				const dir = slash(parse.dir).replace(/\/src\/css\b/, '/dist/css');
				const dest = path.resolve(`dist/${outputdir}/sprite_${parse.name}.png`);
				return slash(path.relative(dir, dest));
			}
		},
		retina: config.useRetina,
		development: isDevelopment,
		filter: /asset\/sprite\/.+\.png$/,
		style: {},
		spritesmith: {
			padding: config.useRetina ? 8 : 2
		},
		pngquant: {
			floyd: 0.8
		}
	};
	if (config.useRetina === 'pc') {
		const style = spriteOptions.style;
		style.backgroundImage = 'normal';
		style.backgroundPosition = 'normal';
		style.backgroundSize = 'normal';
	}
	if (config.useRem) {
		spriteOptions.style.backgroundPosition = 'percent';
	}
	const sprite = new Sprite(spriteOptions);

	/* SASS选项 */
	const sassOptions = {
		functions: sprite.functions(),
		outputStyle: (isDevelopment || config.minifyCSS === false) ? 'expanded' : 'compressed',
		includePaths: [new Library('scss').cwd()]
	};

	/* PostCSS处理器 */
	const processors = [];
	// 1. URL查找
	processors.push(urleditor(function findUrl(url, { from: fromUrl }) {
		let file = path.resolve(fromUrl, '../', url);
		// 如果(默认)从SCSS文件本身出发找不到资源
		if (!fs.existsSync(file)) {
			// 从CSS目录出发查找
			file = path.resolve('./css', url);
			if (fs.existsSync(file)) {
				// 查找后返回相对应SCSS文件本身的路径
				return path.relative(fromUrl, '../', file).replace(/\\/g, '/');
			}
		}
		return url;
	}));
	// 2. 雪碧图
	processors.push(sprite.postcss());
	// 3. 打包的时候添加资源版本号
	if (config.noHash !== true && !isDevelopment) {
		processors.push(urleditor('add-version?cssSrc=src&cssDest=dist&md5=true'));
	}
	// 4. 像素值除以2
	if (config.divideBy2) {
		processors.push(pxeditor('divide-by-two?warn=false&min=3'));
	}
	// 5. processors
	if (config.useRem) {
		processors.push(pxtorem({
			rootValue: 40,
			minPixelValue: 3,
			propWhiteList: new Library('pxtorem').use()()
		}));
	}
	// 6. 添加兼容前缀
	processors.push(autoprefixer({
		browsers: ['iOS >= 8', 'last 2 versions', 'Android >= 4', 'ie >= 9']
	}));

	// 编译
	function compile() {
		return new Promise(function delay(resolve, reject) {
			function onError(e) {
				reject(e);
				this.end();
			}
			// 延迟200ms避免编辑器保存时导致资源不可读而抛出错误
			return setTimeout(function compiler() {
				return gulp.src('src/css/**/*.scss')
					.pipe(sass(sassOptions))
					.on('error', onError)
					.pipe(postcss(processors))
					.on('error', onError)
					.pipe(gulp.dest('dist/css'))
					.on('end', resolve);
			}, 200);
		// 统一捕获错误
		}).catch(function log(e) {
			return emit('log', e.messageFormatted || e.message);
		});
	}

	gulp.task('build:after:css', compile);
	gulp.task('css:update', compile);
	gulp.task('dev:after:css', function addWather() {
		return compile().then(function watch() {
			gulp.watch('src/css/**/*.scss', gulp.series('css:update'));
		});
	});
	// 当然是可以写成下面这样
	// 但这样一来执行的任务多出一个 `watch` 显示
	// gulp.task('dev:after:css', gulp.series('css:update', function watch(cb) {
	// 	gulp.watch('src/css/**/*.scss', gulp.series('css:update'));
	// 	return cb();
	// }));
}