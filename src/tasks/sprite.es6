'use strict';

import fs from 'fs';
import spritesmith from 'gulp.spritesmith';
import Library from '../../library';
import resizer from 'gulp-retina-resizer';
import { createImagemin } from './image';

const spritePath = process.cwd() + '/src/asset/sprite/';
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

function checkRetina() {
	const dirPath = getSubDirPaths().shift();
	if(dirPath) {
		return -1 < fs.readdirSync(spritePath + dirPath).shift().indexOf('@');
	}
	return -1 < fs.readdirSync(spritePath).shift().indexOf('@');
}

function getImageDist() {
	const dirs = ['images', 'img'];
	return fs.readdirSync(process.cwd() + '/src').filter(dir => dirs.includes(dir)).shift() || 'img';
}

export default function(gulp, options, { browser, isBuild }) {

	try {
		fs.accessSync(spritePath, fs.hasOwnProperty('R_OK') ? fs.R_OK : fs.constants.R_OK);
	} catch(e) {
		gulp.task('default:sprite', function() {});
		return;
	}

	const dirPaths = getSubDirPaths();
	const isRetina = Boolean(options.useRetina) || checkRetina();
	const imageDist = getImageDist();

	function createSprite(pathname) {
		if(pathname) {
			const conf = {
				padding: 2,
				imgName: '.temp/sprite/sprite_' + pathname + '.png',
				imgPath: '../' + imageDist + '/sprite_' + pathname + '.png',
				cssName: 'src/css/_sprite_' + pathname + '.scss',
				cssTemplate: tplCreator({byDir: true})
			};
			if(isRetina) {
				Object.assign(conf, {
					retinaImgName: '.temp/sprite/sprite_' + pathname + '@2x.png',
					retinaSrcFilter: '.temp/sprite/resizer/**/*@2x.png',
					retinaImgPath: '../' + imageDist + '/sprite' + (pathname ? '_' + pathname : '') + '@2x.png',
					padding: 8
				});
			}
			return conf;
		}
		const conf = {
			padding: 2,
			imgName: '.temp/sprite/sprite.png',
			imgPath: '../' + imageDist + '/sprite.png',
			cssName: 'src/css/_sprite.scss',
			cssTemplate: tplCreator
		};
		if(isRetina) {
			Object.assign(conf, {
				retinaImgName: '.temp/sprite/sprite@2x.png',
				retinaSrcFilter: '.temp/sprite/resizer/*@2x.png',
				retinaImgPath: '../' + imageDist + '/sprite@2x.png',
				padding: 8
			});	
		}
		return conf;
	}

	if(dirPaths.length) {

		if(isRetina) {
			gulp.task('default:sprite:resizer', function() {
				return Promise.all(dirPaths.map(function(pathname) {
					return new Promise(function(resolve, reject) {
						return gulp.src('src/asset/sprite/' + pathname + '/*.{png,jpg,gif}')
							.pipe(resizer({copy: true}))
							.pipe(gulp.dest('.temp/sprite/resizer/' + pathname))
							.on('end', resolve)
							.on('error', reject);
					});
				}));
			});

			gulp.task('default:sprite:generator', ['default:sprite:resizer'], function() {
				return Promise.all(dirPaths.map(function(pathname) {
					return new Promise(function(resolve, reject) {
						return gulp.src('.temp/sprite/resizer/' + pathname + '/*.{png,jpg,gif}')
							.pipe(spritesmith(createSprite(pathname)))
							.pipe(gulp.dest('./'))
							.on('end', resolve)
							.on('error', reject);
					});
				}));
			});
		} else {

			gulp.task('default:sprite:generator', function() {
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
			gulp.task('default:sprite:resizer', function() {
				return gulp.src('src/asset/sprite/*.{png,jpg,gif}')
					.pipe(resizer({copy: true}))
					.pipe(gulp.dest('.temp/sprite/resizer'));
			});

			gulp.task('default:sprite:generator', ['default:sprite:resizer'], function() {
				return gulp.src('.temp/sprite/resizer/*.{png,jpg,gif}')
					.pipe(spritesmith(createSprite()))
					.pipe(gulp.dest('./'));
			});
		} else {
			gulp.task('default:sprite:generator', function() {
				return gulp.src('src/asset/sprite/*.{png,jpg,gif}')
					.pipe(spritesmith(createSprite()))
					.pipe(gulp.dest('./'));
			});
		}


	}
	gulp.task('default:sprite', ['default:sprite:generator'], function() {
		return gulp.src('.temp/sprite/*.png')
			.pipe(createImagemin())
			.pipe(gulp.dest('dist/' + imageDist))
			.on('end', browser.reload);
	});

	if(!isBuild) {
		gulp.watch(['src/asset/sprite/**/*.{jpg,png,gif}'], ['default:sprite']);
	}

}