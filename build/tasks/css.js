'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (gulp, options, _ref) {
	var defaultEnd = _ref.defaultEnd,
	    browser = _ref.browser,
	    isBuild = _ref.isBuild;


	var settings = getSettings(options);

	var cssHandler = function cssHandler() {
		return new Promise(function (resolve, reject) {
			return setTimeout(function () {
				return gulp.src('src/css/*.scss').pipe((0, _gulpSass2.default)(settings.gulpSass)).on('error', function (e) {
					return reject(e) && this.end();
				}).pipe((0, _gulpPostcss2.default)(settings.gulpPostcss)).pipe(gulp.dest('dist/css')).on('end', resolve).pipe(browser.reload({ stream: true }));
			}, 500);
		}).catch(function (e) {
			return console.warn(e.messageFormatted);
		});
	};
	gulp.task('default:css:init', ['default:sprite', 'default:image'], cssHandler);
	gulp.task('default:css', cssHandler);

	if (!isBuild) {
		defaultEnd(function () {
			gulp.watch('src/css/**/*.scss', ['default:css']);
		});
	}
};

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

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

var _library = require('../../library');

var _library2 = _interopRequireDefault(_library);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function getSettings(options) {

	// gulp-sass
	var gulpSass = Object.assign({ outputStyle: 'compressed' }, options['gulp-sass.css'] || options['gulp-sass']);
	gulpSass.includePaths = (gulpSass.includePaths || []).concat([new _library2.default('scss').cwd()]);

	// postcss-url-editor
	var postcssUrlEditorOption = options['postcss-url-editor.css'] || options['postcss-url-editor'];
	var postcssUrlEditor = [];
	if (postcssUrlEditorOption) {

		if (Array.isArray(postcssUrlEditorOption)) {
			postcssUrlEditor.splice.apply(postcssUrlEditor, [0, 0].concat(_toConsumableArray(postcssUrlEditorOption)));
		} else if (postcssUrlEditorOption) {
			postcssUrlEditor.push(postcssUrlEditorOption);
		}

		var isContainingAddVersion = function (option) {
			var checkHandler = function checkHandler(str) {
				return 'string' === typeof str && -1 < str.indexOf('add-version');
			};

			if (Array.isArray(option)) {
				return Boolean(option.find(checkHandler));
			}

			return checkHandler(option);
		}(postcssUrlEditorOption);

		if (!isContainingAddVersion) {
			postcssUrlEditor.push('add-version?md5Base=dist/css');
		}
	} else {
		postcssUrlEditor.push('add-version?md5Base=dist/css');
	}

	// pxtorem
	var pxtoremOption = options['postcss-pxtorem.css'] || options['postcss-pxtorem'];
	var useRem = pxtoremOption || options.useRem;
	var postcssPxtorem = Object.assign({ rootValue: 40, minPixelValue: 3, propWhiteList: options.remProps }, pxtoremOption);
	var propWhiteList = postcssPxtorem.propWhiteList || [];
	postcssPxtorem.propWhiteList = new _library2.default('pxtorem').use().apply(undefined, _toConsumableArray(propWhiteList));

	// postcss-px-editor
	var postcssPxEditorOption = options['postcss-px-editor.css'] || options['postcss-px-editor'];
	var postcssPxEditor = [];
	var db2Option = options.divideBy2;
	var divideBy2 = 'string' === typeof db2Option ? db2Option : 'object' === (typeof db2Option === 'undefined' ? 'undefined' : _typeof(db2Option)) ? _querystring2.default.stringify(db2Option) : '_';
	if (postcssPxEditorOption) {

		if (Array.isArray(postcssPxEditorOption)) {
			postcssPxEditor.splice.apply(postcssPxEditor, [0, 0].concat(_toConsumableArray(postcssPxEditorOption)));
		} else if (postcssPxEditorOption) {
			postcssPxEditor.push(postcssPxEditorOption);
		}

		if (db2Option && !useRem) {
			var isContainingDB2 = function (option) {
				var checkHandler = function checkHandler(str) {
					return 'string' === typeof str && -1 < str.indexOf('divide-by-two');
				};

				if (Array.isArray(option)) {
					return Boolean(option.find(checkHandler));
				}

				return checkHandler(option);
			}(postcssPxEditorOption);

			if (!isContainingDB2) {
				postcssPxEditor.push('divide-by-two?' + divideBy2);
			}
		}
	} else if (db2Option && !useRem) {
		postcssPxEditor.push('divide-by-two?' + divideBy2);
	}

	// gulp-postcss
	var gulpPostcss = options['gulp-postcss.css'] || options['gulp-postcss'] || [];
	gulpPostcss.push((0, _postcssUrlEditor2.default)(postcssUrlEditor));
	if (postcssPxEditor.length) {
		gulpPostcss.push((0, _postcssPxEditor2.default)(postcssPxEditor));
	}
	if (useRem) {
		gulpPostcss.push((0, _postcssPxtorem2.default)(postcssPxtorem));
	}
	gulpPostcss.push((0, _autoprefixer2.default)(['iOS >= 7', 'last 2 versions', 'Android >= 2', 'ie >= 7', 'Firefox >= 4', 'Chrome >= 4']));

	return { gulpPostcss: gulpPostcss, gulpSass: gulpSass };
}