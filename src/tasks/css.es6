'use strict';

import querystring from 'querystring';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';
import urlEditor from 'postcss-url-editor';
import pxEditor from 'postcss-px-editor';
import Library from '../../library';

function getSettings(options) {

	// gulp-sass
	const gulpSass = Object.assign({outputStyle: 'compressed'}, options['gulp-sass.css'] || options['gulp-sass']);
	gulpSass.includePaths = (gulpSass.includePaths || []).concat([new Library('scss').cwd()]);

	// postcss-url-editor
	const postcssUrlEditorOption = options['postcss-url-editor.css'] || options['postcss-url-editor'];
	const postcssUrlEditor = [];
	if(postcssUrlEditorOption) {

		if(Array.isArray(postcssUrlEditorOption)) {
			postcssUrlEditor.splice(0, 0, ...postcssUrlEditorOption);
		} else if(postcssUrlEditorOption) {
			postcssUrlEditor.push(postcssUrlEditorOption);
		}

		const isContainingAddVersion = function(option) {
			const checkHandler = function(str) {
				return ('string' === typeof str) && (-1 < str.indexOf('add-version'));
			}

			if(Array.isArray(option)) {
				return Boolean(option.find(checkHandler));
			}

			return checkHandler(option);
		}(postcssUrlEditorOption);

		if(!isContainingAddVersion) {
			postcssUrlEditor.push('add-version?md5Base=dist/css');
		}
	} else {
		postcssUrlEditor.push('add-version?md5Base=dist/css');
	}

	// pxtorem
	const pxtoremOption = options['postcss-pxtorem.css'] || options['postcss-pxtorem'];
	const useRem = pxtoremOption || options.useRem;
	const postcssPxtorem = Object.assign({rootValue: 40, minPixelValue: 3, propWhiteList: options.remProps}, pxtoremOption);
	const propWhiteList = postcssPxtorem.propWhiteList || [];
	postcssPxtorem.propWhiteList = new Library('pxtorem').use()(...propWhiteList);

	// postcss-px-editor
	const postcssPxEditorOption = options['postcss-px-editor.css'] || options['postcss-px-editor'];
	const postcssPxEditor = [];
	const db2Option = options.divideBy2;
	const divideBy2 = 'string' === typeof db2Option ? db2Option : ('object' === typeof db2Option ? querystring.stringify(db2Option) : '_');
	if(postcssPxEditorOption) {

		if(Array.isArray(postcssPxEditorOption)) {
			postcssPxEditor.splice(0, 0, ...postcssPxEditorOption);
		} else if(postcssPxEditorOption) {
			postcssPxEditor.push(postcssPxEditorOption);
		}

		if(db2Option && !useRem) {
			const isContainingDB2 = function(option) {
				const checkHandler = function(str) {
					return ('string' === typeof str) && (-1 < str.indexOf('divide-by-two'));
				};

				if(Array.isArray(option)) {
					return Boolean(option.find(checkHandler));
				}

				return checkHandler(option);
			}(postcssPxEditorOption);

			if(!isContainingDB2) {
				postcssPxEditor.push('divide-by-two?' + divideBy2);
			}
		}
	} else if(db2Option && !useRem) {
		postcssPxEditor.push('divide-by-two?' + divideBy2);
	}

	// gulp-postcss
	const gulpPostcss = options['gulp-postcss.css'] || options['gulp-postcss'] || [];
	gulpPostcss.push(urlEditor(postcssUrlEditor));
	if(postcssPxEditor.length) {
		gulpPostcss.push(pxEditor(postcssPxEditor));
	}
	if(useRem) {
		gulpPostcss.push(pxtorem(postcssPxtorem));
	}
	gulpPostcss.push(autoprefixer(['iOS >= 7', 'last 2 versions', 'Android >= 2', 'ie >= 7', 'Firefox >= 4', 'Chrome >= 4']));

	return { gulpPostcss, gulpSass };
}

export default function(gulp, options, { defaultEnd, browser, isBuild }) {

	const settings = getSettings(options);

	const cssHandler = function() {
		return new Promise(function(resolve, reject) {
			return setTimeout(function() {
				return gulp.src('src/css/*.scss')
					.pipe(sass(settings.gulpSass))
					.on('error', function(e) {
						return reject(e) && this.end();
					})
					.pipe(postcss(settings.gulpPostcss))
					.pipe(gulp.dest('dist/css'))
					.on('end', resolve)
					.pipe(browser.reload({stream: true}));
			}, 500);
		}).catch(function(e) {
			return console.warn(e.messageFormatted);
		});
	};
	gulp.task('default:css:init', ['default:sprite', 'default:image'], cssHandler);
	gulp.task('default:css', cssHandler);

	if(!isBuild) {
		defaultEnd(function() {
			gulp.watch('src/css/**/*.scss', ['default:css']);
		});
	}
}