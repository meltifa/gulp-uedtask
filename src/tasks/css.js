'use strict';

import del from 'del';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';
import assets from 'postcss-assets';
import urlEditor from 'postcss-url-editor';
import pxEditor from 'postcss-px-editor';
import Library from '../../library';
import newer from 'gulp-newer';

function getSettings(options) {
	const isDivideBy2 = Boolean(options.divideBy2);
	const isUsingRem = Boolean(options.useRem);
	const isNoHash = Boolean(options.noHash);
	const rootValue = parseInt(options.rootValue, 10) || 40;

	const settings = [];

	if (!isNoHash) {
		settings.push(urlEditor('add-version?cssSrc=src&cssDest=dist&md5=true'));
	}
	if (isUsingRem) {
		settings.push(pxtorem({
			rootValue,
			minPixelValue: 3,
			propWhiteList: new Library('pxtorem').use()()
		}));
	} else if (isDivideBy2) {
		settings.push(pxEditor('divide-by-two?warn=true&min=3'));
	}
	settings.push(
		autoprefixer(['iOS >= 8', 'last 2 versions', 'Android >= 4', 'ie >= 9']),
		assets({
			relative: true,
			loadPaths: ['dist/images/sprite', 'dist/img/sprite']
		})
	);

	return settings;
}

export default function (options, {
	gulp,
	TaskLogger,
	TaskListener
}) {

	const settings = getSettings(options);

	let outputStyle = 'compressed';
	gulp.task('dev:before:css', function () {
		outputStyle = 'expanded';
	});

	const cssHandler = function () {
		return new Promise(function (resolve, reject) {
				return setTimeout(function () {
					return gulp.src('src/css/**/*.scss')
						.pipe(newer('dist/css'))
						.pipe(sass({
							outputStyle,
							includePaths: [new Library('scss').cwd(), process.cwd() + '/src/css/sprite']
						}))
						.on('error', sass.logError)
						// .pipe(postcss(settings))
						.pipe(gulp.dest('dist/css'))
						.on('end', resolve);
				}, 200);
			})
			.then(function () {
				return new Promise(function (resolve, reject) {
					return setTimeout(function () {
						return gulp.src('dist/css/**/*.css')
							.pipe(newer('dist/css'))
							.pipe(postcss(settings))
							.pipe(gulp.dest('dist/css'))
							.on('end', resolve);
					}, 200);
				})
			})
			.catch(function (e) {
				return console.warn(e.messageFormatted);
			});
	};

	TaskListener.subscribe('ready', function initDefault() {
		const allTasks = TaskLogger.getAllTasks();
		const defaultDeps = ['default:sprite', 'default:image', 'default:webfont', 'default:iconfont'];
		const dependencies = defaultDeps.filter(dep => -1 < allTasks.indexOf(dep));
		gulp.task('default:css', dependencies, cssHandler);
		TaskListener.unsubscribe('ready', initDefault);
	});

	gulp.task('css:update', cssHandler);

	gulp.task('dev:after:css', function () {
		gulp.watch('src/css/**/*.scss', ['css:update']);
	});

	gulp.task('build:before:css', function () {
		return del('dist/css/**');
	});
}