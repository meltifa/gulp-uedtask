'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (options, { gulp }) {

	try {
		_fs2.default.accessSync(spritePath, _fs2.default.hasOwnProperty('R_OK') ? _fs2.default.R_OK : _fs2.default.constants.R_OK);
	} catch (e) {
		return void 0;
	}

	const dirPaths = getSubDirPaths();
	const isRetina = Boolean(options.useRetina);
	const isRem = Boolean(options.useRem);
	const isDivideBy2 = Boolean(options.divideBy2);
	const isOnlyRetina = !isDivideBy2 && isRetina;
	const imageDist = getImageDist() + '/sprite';

	function createSprite(pathname) {
		if (pathname) {
			const conf = {
				padding: 2,
				imgName: '.tempsprite/sprite_' + pathname + '.png',
				imgPath: '/' + imageDist + '/sprite_' + pathname + '.png',
				cssName: 'src/css/sprite/_sprite_' + pathname + '.scss',
				cssTemplate: tplCreator({ byDir: true, isRem, isOnlyRetina })
			};
			if (isRetina) {
				Object.assign(conf, {
					retinaImgName: '.tempsprite/sprite_' + pathname + '@2x.png',
					retinaSrcFilter: '.tempsprite/resizer/**/*@2x.png',
					retinaImgPath: '/' + imageDist + '/sprite' + (pathname ? '_' + pathname : '') + '@2x.png',
					padding: 8
				});
			}
			return conf;
		}
		const conf = {
			padding: 2,
			imgName: '.tempsprite/sprite.png',
			imgPath: '/' + imageDist + '/sprite.png',
			cssName: 'src/css/sprite/_sprite.scss',
			cssTemplate: tplCreator({ isRem, isOnlyRetina })
		};
		if (isRetina) {
			Object.assign(conf, {
				retinaImgName: '.tempsprite/sprite@2x.png',
				retinaSrcFilter: '.tempsprite/resizer/*@2x.png',
				retinaImgPath: '/' + imageDist + '/sprite@2x.png',
				padding: 8
			});
		}
		return conf;
	}

	if (dirPaths.length) {

		if (isRetina) {
			gulp.task('sprite:resizer', function () {
				return Promise.all(dirPaths.map(function (pathname) {
					return new Promise(function (resolve, reject) {
						return gulp.src('src/asset/sprite/' + pathname + '/*.{png,jpg,gif}').pipe((0, _gulpRetinaResizer2.default)({ copy: true })).pipe(gulp.dest('.tempsprite/resizer/' + pathname)).on('end', resolve).on('error', reject);
					});
				}));
			});

			gulp.task('sprite:generator', ['sprite:resizer'], function () {
				return Promise.all(dirPaths.map(function (pathname) {
					return new Promise(function (resolve, reject) {
						return gulp.src('.tempsprite/resizer/' + pathname + '/*.{png,jpg,gif}').pipe((0, _gulp2.default)(createSprite(pathname))).pipe(gulp.dest('./')).on('end', resolve).on('error', reject);
					});
				}));
			});
		} else {

			gulp.task('sprite:generator', function () {
				return Promise.all(dirPaths.map(function (pathname) {
					return new Promise(function (resolve, reject) {
						return gulp.src('src/asset/sprite/' + pathname + '/*.{png,jpg,gif}').pipe((0, _gulp2.default)(createSprite(pathname))).pipe(gulp.dest('./')).on('end', resolve).on('error', reject);
					});
				}));
			});
		}
	} else {

		if (isRetina) {
			gulp.task('sprite:resizer', function () {
				return gulp.src('src/asset/sprite/*.{png,jpg,gif}').pipe((0, _gulpRetinaResizer2.default)({ copy: true })).pipe(gulp.dest('.tempsprite/resizer'));
			});

			gulp.task('sprite:generator', ['sprite:resizer'], function () {
				return gulp.src('.tempsprite/resizer/*.{png,jpg,gif}').pipe((0, _gulp2.default)(createSprite())).pipe(gulp.dest('./'));
			});
		} else {
			gulp.task('sprite:generator', function () {
				return gulp.src('src/asset/sprite/*.{png,jpg,gif}').pipe((0, _gulp2.default)(createSprite())).pipe(gulp.dest('./'));
			});
		}
	}
	gulp.task('sprite:create', ['sprite:generator'], function () {
		return gulp.src('.tempsprite/*.png').pipe((0, _image.createImagemin)()).pipe(gulp.dest('dist/' + imageDist));
	});

	gulp.task('default:sprite', ['sprite:create'], function () {
		return (0, _del2.default)('.tempsprite/**').catch(function () {
			return (0, _gulpUtil.log)(_gulpUtil.colors.yellow('Unable to remove `./tempsprite`, please delete it manually!'));
		});
	});

	gulp.task('dev:after:sprite', function () {
		gulp.watch(['src/asset/sprite/**/*.{jpg,png,gif}'], ['default:sprite']);
	});
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _gulp = require('gulp.spritesmith');

var _gulp2 = _interopRequireDefault(_gulp);

var _library = require('../../library');

var _library2 = _interopRequireDefault(_library);

var _gulpRetinaResizer = require('gulp-retina-resizer');

var _gulpRetinaResizer2 = _interopRequireDefault(_gulpRetinaResizer);

var _image = require('./image');

var _gulpUtil = require('gulp-util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CWD = process.cwd();
const spritePath = CWD + '/src/asset/sprite/';
const tplCreator = new _library2.default('sprite').use();

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

function getImageDist() {
	const dirs = ['images', 'img'];
	return _fs2.default.readdirSync(CWD + '/src').filter(dir => dirs.includes(dir)).shift() || 'img';
}