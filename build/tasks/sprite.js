'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (gulp, options, _ref) {
	var browser = _ref.browser,
	    isBuild = _ref.isBuild;


	try {
		_fs2.default.accessSync(spritePath, _fs2.default.hasOwnProperty('R_OK') ? _fs2.default.R_OK : _fs2.default.constants.R_OK);
	} catch (e) {
		gulp.task('default:sprite', function () {});
		return;
	}

	var dirPaths = getSubDirPaths();
	var isRetina = Boolean(options.useRetina) || checkRetina();
	var imageDist = getImageDist();

	function createSprite(pathname) {
		if (pathname) {
			var _conf = {
				padding: 2,
				imgName: '.temp/sprite/sprite_' + pathname + '.png',
				imgPath: '../' + imageDist + '/sprite_' + pathname + '.png',
				cssName: 'src/css/_sprite_' + pathname + '.scss',
				cssTemplate: tplCreator({ byDir: true })
			};
			if (isRetina) {
				Object.assign(_conf, {
					retinaImgName: '.temp/sprite/sprite_' + pathname + '@2x.png',
					retinaSrcFilter: '.temp/sprite/resizer/**/*@2x.png',
					retinaImgPath: '../' + imageDist + '/sprite' + (pathname ? '_' + pathname : '') + '@2x.png',
					padding: 8
				});
			}
			return _conf;
		}
		var conf = {
			padding: 2,
			imgName: '.temp/sprite/sprite.png',
			imgPath: '../' + imageDist + '/sprite.png',
			cssName: 'src/css/_sprite.scss',
			cssTemplate: tplCreator
		};
		if (isRetina) {
			Object.assign(conf, {
				retinaImgName: '.temp/sprite/sprite@2x.png',
				retinaSrcFilter: '.temp/sprite/resizer/*@2x.png',
				retinaImgPath: '../' + imageDist + '/sprite@2x.png',
				padding: 8
			});
		}
		return conf;
	}

	if (dirPaths.length) {

		if (isRetina) {
			gulp.task('default:sprite:resizer', function () {
				return Promise.all(dirPaths.map(function (pathname) {
					return new Promise(function (resolve, reject) {
						return gulp.src('src/asset/sprite/' + pathname + '/*.{png,jpg,gif}').pipe((0, _gulpRetinaResizer2.default)({ copy: true })).pipe(gulp.dest('.temp/sprite/resizer/' + pathname)).on('end', resolve).on('error', reject);
					});
				}));
			});

			gulp.task('default:sprite:generator', ['default:sprite:resizer'], function () {
				return Promise.all(dirPaths.map(function (pathname) {
					return new Promise(function (resolve, reject) {
						return gulp.src('.temp/sprite/resizer/' + pathname + '/*.{png,jpg,gif}').pipe((0, _gulp2.default)(createSprite(pathname))).pipe(gulp.dest('./')).on('end', resolve).on('error', reject);
					});
				}));
			});
		} else {

			gulp.task('default:sprite:generator', function () {
				return Promise.all(dirPaths.map(function (pathname) {
					return new Promise(function (resolve, reject) {
						return gulp.src('src/asset/sprite/' + pathname + '/*.{png,jpg,gif}').pipe((0, _gulp2.default)(createSprite(pathname))).pipe(gulp.dest('./')).on('end', resolve).on('error', reject);
					});
				}));
			});
		}
	} else {

		if (isRetina) {
			gulp.task('default:sprite:resizer', function () {
				return gulp.src('src/asset/sprite/*.{png,jpg,gif}').pipe((0, _gulpRetinaResizer2.default)({ copy: true })).pipe(gulp.dest('.temp/sprite/resizer'));
			});

			gulp.task('default:sprite:generator', ['default:sprite:resizer'], function () {
				return gulp.src('.temp/sprite/resizer/*.{png,jpg,gif}').pipe((0, _gulp2.default)(createSprite())).pipe(gulp.dest('./'));
			});
		} else {
			gulp.task('default:sprite:generator', function () {
				return gulp.src('src/asset/sprite/*.{png,jpg,gif}').pipe((0, _gulp2.default)(createSprite())).pipe(gulp.dest('./'));
			});
		}
	}
	gulp.task('default:sprite', ['default:sprite:generator'], function () {
		return gulp.src('.temp/sprite/*.png').pipe((0, _image.createImagemin)()).pipe(gulp.dest('dist/' + imageDist)).on('end', browser.reload);
	});

	if (!isBuild) {
		gulp.watch(['src/asset/sprite/**/*.{jpg,png,gif}'], ['default:sprite']);
	}
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _gulp = require('gulp.spritesmith');

var _gulp2 = _interopRequireDefault(_gulp);

var _library = require('../../library');

var _library2 = _interopRequireDefault(_library);

var _gulpRetinaResizer = require('gulp-retina-resizer');

var _gulpRetinaResizer2 = _interopRequireDefault(_gulpRetinaResizer);

var _image = require('./image');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var spritePath = process.cwd() + '/src/asset/sprite/';
var tplCreator = new _library2.default('sprite').use();

function getSubDirPaths() {
	return _fs2.default.readdirSync(spritePath).reduce(function (box, file) {
		if (0 !== file.indexOf('_')) {
			if (_fs2.default.lstatSync(spritePath + file).isDirectory()) {
				box.push(file);
			}
		}
		return box;
	}, []);
}

function checkRetina() {
	var dirPath = getSubDirPaths().shift();
	if (dirPath) {
		return -1 < _fs2.default.readdirSync(spritePath + dirPath).shift().indexOf('@');
	}
	return -1 < _fs2.default.readdirSync(spritePath).shift().indexOf('@');
}

function getImageDist() {
	var dirs = ['images', 'img'];
	return _fs2.default.readdirSync(process.cwd() + '/src').filter(function (dir) {
		return dirs.includes(dir);
	}).shift() || 'img';
}