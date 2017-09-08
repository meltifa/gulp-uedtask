'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = css;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulpSass = require('gulp-sass');

var _gulpSass2 = _interopRequireDefault(_gulpSass);

var _gulpPostcss = require('gulp-postcss');

var _gulpPostcss2 = _interopRequireDefault(_gulpPostcss);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _postcssPxtorem = require('postcss-pxtorem');

var _postcssPxtorem2 = _interopRequireDefault(_postcssPxtorem);

var _postcssUrlEditor = require('postcss-url-editor');

var _postcssUrlEditor2 = _interopRequireDefault(_postcssUrlEditor);

var _postcssPxEditor = require('postcss-px-editor');

var _postcssPxEditor2 = _interopRequireDefault(_postcssPxEditor);

var _postcssSpriteProperty = require('postcss-sprite-property');

var _postcssSpriteProperty2 = _interopRequireDefault(_postcssSpriteProperty);

var _library = require('../../library');

var _library2 = _interopRequireDefault(_library);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 图片文件夹名
// 先判断是否已存在，否则默认 images
function imgdir() {
	var dirs = ['images', 'img'];
	var dir = dirs.find(function (dirpath) {
		return _fs2.default.existsSync(_path2.default.resolve('src/' + dirpath));
	});
	return dir || dirs.shift();
}

function css(gulp) {
	var config = this.config,
	    commands = this.commands,
	    emit = this.emit;

	var isDevelopment = commands.indexOf('dev') > -1;

	/* 雪碧图配置 */
	var outputdir = imgdir();
	var spriteOptions = {
		path: {
			include: ['src/css', 'src/asset/sprite'],
			output: 'dist/' + outputdir + '/sprite/[name].png',
			public: function _public(_ref) {
				var input = _ref.input;

				var parse = _path2.default.parse(input);
				var dir = (0, _utils.slash)(parse.dir).replace(/\/src\/css\b/, '/dist/css');
				var dest = _path2.default.resolve('dist/' + outputdir + '/sprite/' + parse.name + '.png');
				return (0, _utils.slash)(_path2.default.relative(dir, dest));
			}
		},
		retina: config.useRetina,
		divide: config.useRetina === 'pc',
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
	if (config.useRem) {
		spriteOptions.style.backgroundPosition = 'percent';
	}
	var sprite = new _postcssSpriteProperty2.default(spriteOptions);

	/* SASS选项 */
	var sassOptions = {
		functions: sprite.functions(),
		outputStyle: isDevelopment || config.minifyCSS === false ? 'expanded' : 'compressed',
		includePaths: [new _library2.default('scss').cwd()]
	};

	/* PostCSS处理器 */
	var processors = [];
	// 1. URL查找
	processors.push((0, _postcssUrlEditor2.default)(function findUrl(url, _ref2) {
		var fromUrl = _ref2.from;

		var file = _path2.default.resolve(fromUrl, '../', url);
		// 如果(默认)从SCSS文件本身出发找不到资源
		if (!_fs2.default.existsSync(file)) {
			// 从CSS目录出发查找
			file = _path2.default.resolve('./css', url);
			if (_fs2.default.existsSync(file)) {
				// 查找后返回相对应SCSS文件本身的路径
				return _path2.default.relative(fromUrl, '../', file).replace(/\\/g, '/');
			}
		}
		return url;
	}));
	// 2. 雪碧图
	processors.push(sprite.postcss());
	// 3. 打包的时候添加资源版本号
	if (config.noHash !== true && !isDevelopment) {
		processors.push((0, _postcssUrlEditor2.default)('add-version?cssSrc=src&cssDest=dist&md5=true'));
	}
	// 4. 像素值除以2
	if (config.divideBy2) {
		processors.push((0, _postcssPxEditor2.default)('divide-by-two?warn=true&min=3'));
	}
	// 5. processors
	if (config.useRem) {
		processors.push((0, _postcssPxtorem2.default)({
			rootValue: 40,
			minPixelValue: 3,
			propWhiteList: new _library2.default('pxtorem').use()()
		}));
	}
	// 6. 添加兼容前缀
	processors.push((0, _autoprefixer2.default)({
		browsers: ['iOS >= 8', 'last 2 versions', 'Android >= 4', 'ie >= 9']
	}));

	// 编译
	function compile() {
		return new _promise2.default(function delay(resolve, reject) {
			function onError(e) {
				reject(e);
				this.end();
			}
			// 延迟200ms避免编辑器保存时导致资源不可读而抛出错误
			return setTimeout(function compiler() {
				return gulp.src('src/css/**/*.scss').pipe((0, _gulpSass2.default)(sassOptions)).on('error', onError).pipe((0, _gulpPostcss2.default)(processors)).on('error', onError).pipe(gulp.dest('dist/css')).on('end', resolve);
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