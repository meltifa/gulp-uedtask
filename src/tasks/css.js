'use strict';

import del from 'del';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';
import urlEditor from 'postcss-url-editor';
import pxEditor from 'postcss-px-editor';
import Library from '../../library';

function getSettings(options) {
	const isUsingRem = Boolean(options.useRem);
	const isDividedBy2 = Boolean(options.divideBy2);

	const settings = [];
	settings.push(urlEditor('add-version?cssSrc=src&cssDest=dist&md5=true'));
	if(isUsingRem) {
		settings.push(pxtorem({
			rootValue: 40,
			minPixelValue: 3,
			propWhiteList: new Library('pxtorem').use()()
		}));
	} else if(isDividedBy2) {
		settings.push(pxEditor('divide-by-two?warn=true&min=3'));
	}
	settings.push(autoprefixer(['iOS >= 7', 'last 2 versions', 'Android >= 2', 'ie >= 7', 'Firefox >= 4', 'Chrome >= 4']));

	return settings;
}

export default function(options, { gulp, TaskLogger, TaskListener }) {

	const settings = getSettings(options);

	let outputStyle = 'compressed';
	gulp.task('dev:before:css', function() {
		outputStyle = 'nested';
	});

	const cssHandler = function() {
		return new Promise(function(resolve, reject) {
			return setTimeout(function() {
				return gulp.src('src/css/*.scss')
					.pipe(sass({
						outputStyle,
						includePaths: new Library('scss').cwd()
					}))
					.on('error', function(e) {
						return reject(e) && this.end();
					})
					.pipe(postcss(settings))
					.pipe(gulp.dest('dist/css'))
					.on('end', resolve);
			}, 500);
		}).catch(function(e) {
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

	gulp.task('dev:after:css', function() {
		gulp.watch('src/css/**/*.scss', ['css:update']);
	});

	gulp.task('build:before:css', function() {
		return del('dist/css/**');
	});
}