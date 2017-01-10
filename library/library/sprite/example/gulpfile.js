'use strict';

var fs = require('fs');
var gulp = require('gulp');
var sass = require('gulp-sass');
var spritesmith = require('gulp.spritesmith');

var cssTemplate = require('../index');

gulp.task('sprite:multi', function() {
	var base = 'src/sprite';
	var createPromise = function(dir) {
		return new Promise(function(resolve, reject) {
			return gulp.src(base + '/' + dir + '/*.{png,jpg,gif}')
				.pipe(spritesmith({
					padding: 4,
					imgName: 'img/_spr_m_' + dir + '.png',
					retinaImgName: 'img/_spr_m_' + dir + '@2x.png',
					retinaSrcFilter: base + '/' + dir + '/*@2x.{png,jpg,gif}',
					cssName: 'scss/_spr_m_' + dir + '.scss',
					cssTemplate: cssTemplate({byDir: true})
				}))
				.pipe(gulp.dest('src'))
				.on('error', reject)
				.on('end', resolve);
		});
	};
	var promises = fs.readdirSync(base).reduce(function(arr, dirname) {
		var lstat = fs.lstatSync((base + '/' + dirname).replace(/[/\\]{2}/g, '/'));
		if(lstat.isDirectory()) {
			arr.push(createPromise(dirname));
		}
		return arr;
	}, []);
	return Promise.all(promises);
});

gulp.task('sprite:single_by_dir', function() {
	return gulp.src('src/sprite/**/*.{png,jpg,gif}')
		.pipe(spritesmith({
			padding: 4,
			imgName: 'img/_spr_sbd.png',
			retinaImgName: 'img/_spr_sbd@2x.png',
			retinaSrcFilter: 'src/sprite/**/*@2x.{png,jpg,gif}',
			cssName: 'scss/_spr_sbd.scss',
			cssTemplate: cssTemplate({byDir: true})
		}))
		.pipe(gulp.dest('src'));
});

gulp.task('sprite:single', function() {
	return gulp.src('src/sprite/**/*.{png,jpg,gif}')
		.pipe(spritesmith({
			padding: 4,
			imgName: 'img/_spr_s.png',
			retinaImgName: 'img/_spr_s@2x.png',
			retinaSrcFilter: 'src/sprite/**/*@2x.{png,jpg,gif}',
			cssName: 'scss/_spr_s.scss',
			cssTemplate: cssTemplate
		}))
		.pipe(gulp.dest('src'));
});

gulp.task('default', ['sprite:multi', 'sprite:single_by_dir', 'sprite:single'], function() {
	return gulp.src('src/scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('src/css'));
});