'use strict';

import fs from 'fs';
import del from 'del';
import spritesmith from 'gulp.spritesmith';
import Library from '../../library';
import resizer from 'gulp-retina-resizer';
import { createImagemin } from './image';
import { log, colors } from 'gulp-util';

const CWD = process.cwd();
const spritePath = CWD + '/src/asset/sprite/';
const tplCreator = new Library('sprite').use();

function getSubDirPaths() {
	return fs.readdirSync(spritePath).reduce(function(box, file) {
		if(0 !== file.indexOf('_')) {
			if(fs.lstatSync(spritePath + file).isDirectory()) {
				box.push(file);
			}
		}
		return box;
	}, []);
}

function getImageDist() {
	const dirs = ['images', 'img'];
	return fs.readdirSync(CWD + '/src').filter(dir => dirs.includes(dir)).shift() || 'img';
}

export default function(options, { gulp }) {

	try {
		fs.accessSync(spritePath, fs.hasOwnProperty('R_OK') ? fs.R_OK : fs.constants.R_OK);
	} catch(e) {
		return void 0;
	}

	const dirPaths = getSubDirPaths();
	const isRetina = Boolean(options.useRetina);
	const isRem = Boolean(options.useRem);
	const imageDist = getImageDist();

	function createSprite(pathname) {
		if(pathname) {
			const conf = {
				padding: 2,
				imgName: '.tempsprite/sprite_' + pathname + '.png',
				imgPath: '../' + imageDist + '/sprite_' + pathname + '.png',
				cssName: 'src/css/_sprite_' + pathname + '.scss',
				cssTemplate: tplCreator({ byDir: true, isRem })
			};
			if(isRetina) {
				Object.assign(conf, {
					retinaImgName: '.tempsprite/sprite_' + pathname + '@2x.png',
					retinaSrcFilter: '.tempsprite/resizer/**/*@2x.png',
					retinaImgPath: '../' + imageDist + '/sprite' + (pathname ? '_' + pathname : '') + '@2x.png',
					padding: 8
				});
			}
			return conf;
		}
		const conf = {
			padding: 2,
			imgName: '.tempsprite/sprite.png',
			imgPath: '../' + imageDist + '/sprite.png',
			cssName: 'src/css/_sprite.scss',
			cssTemplate: tplCreator({ isRem })
		};
		if(isRetina) {
			Object.assign(conf, {
				retinaImgName: '.tempsprite/sprite@2x.png',
				retinaSrcFilter: '.tempsprite/resizer/*@2x.png',
				retinaImgPath: '../' + imageDist + '/sprite@2x.png',
				padding: 8
			});	
		}
		return conf;
	}

	if(dirPaths.length) {

		if(isRetina) {
			gulp.task('sprite:resizer', function() {
				return Promise.all(dirPaths.map(function(pathname) {
					return new Promise(function(resolve, reject) {
						return gulp.src('src/asset/sprite/' + pathname + '/*.{png,jpg,gif}')
							.pipe(resizer({copy: true}))
							.pipe(gulp.dest('.tempsprite/resizer/' + pathname))
							.on('end', resolve)
							.on('error', reject);
					});
				}));
			});

			gulp.task('sprite:generator', ['sprite:resizer'], function() {
				return Promise.all(dirPaths.map(function(pathname) {
					return new Promise(function(resolve, reject) {
						return gulp.src('.tempsprite/resizer/' + pathname + '/*.{png,jpg,gif}')
							.pipe(spritesmith(createSprite(pathname)))
							.pipe(gulp.dest('./'))
							.on('end', resolve)
							.on('error', reject);
					});
				}));
			});
		} else {

			gulp.task('sprite:generator', function() {
				return Promise.all(dirPaths.map(function(pathname) {
					return new Promise(function(resolve, reject) {
						return gulp.src('src/asset/sprite/' + pathname + '/*.{png,jpg,gif}')
							.pipe(spritesmith(createSprite(pathname)))
							.pipe(gulp.dest('./'))
							.on('end', resolve)
							.on('error', reject);
					});
				}));
			});
		}

	} else {

		if(isRetina) {
			gulp.task('sprite:resizer', function() {
				return gulp.src('src/asset/sprite/*.{png,jpg,gif}')
					.pipe(resizer({copy: true}))
					.pipe(gulp.dest('.tempsprite/resizer'));
			});

			gulp.task('sprite:generator', ['sprite:resizer'], function() {
				return gulp.src('.tempsprite/resizer/*.{png,jpg,gif}')
					.pipe(spritesmith(createSprite()))
					.pipe(gulp.dest('./'));
			});
		} else {
			gulp.task('sprite:generator', function() {
				return gulp.src('src/asset/sprite/*.{png,jpg,gif}')
					.pipe(spritesmith(createSprite()))
					.pipe(gulp.dest('./'));
			});
		}

	}
	gulp.task('default:sprite', ['sprite:generator'], function() {
		return gulp.src('.tempsprite/*.png')
			.pipe(createImagemin())
			.pipe(gulp.dest('dist/' + imageDist));
	});

	gulp.task('default:after:sprite', function() {
		return del('.tempsprite/**').catch(function() {
			return log(colors.yellow('Unable to remove `./tempsprite`, please delete it manually!'));
		});
	});

	gulp.task('dev:after:sprite', function() {
		gulp.watch(['src/asset/sprite/**/*.{jpg,png,gif}'], ['default:sprite']);
	});

}