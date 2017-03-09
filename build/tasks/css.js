'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (options, _ref) {
	var gulp = _ref.gulp,
	    TaskLogger = _ref.TaskLogger,
	    TaskListener = _ref.TaskListener;


	var settings = getSettings(options);

	var outputStyle = 'compressed';
	gulp.task('dev:before:css', function () {
		outputStyle = 'nested';
	});

	var cssHandler = function cssHandler() {
		return new Promise(function (resolve, reject) {
			return setTimeout(function () {
				return gulp.src('src/css/*.scss').pipe((0, _gulpSass2.default)({
					outputStyle: outputStyle,
					includePaths: new _library2.default('scss').cwd()
				})).on('error', function (e) {
					return reject(e) && this.end();
				}).pipe((0, _gulpPostcss2.default)(settings)).pipe(gulp.dest('dist/css')).on('end', resolve);
			}, 500);
		}).catch(function (e) {
			return console.warn(e.messageFormatted);
		});
	};

	TaskListener.subscribe('ready', function initDefault() {
		var allTasks = TaskLogger.getAllTasks();
		var defaultDeps = ['default:sprite', 'default:image', 'default:webfont', 'default:iconfont'];
		var dependencies = defaultDeps.filter(function (dep) {
			return -1 < allTasks.indexOf(dep);
		});
		gulp.task('default:css', dependencies, cssHandler);
		TaskListener.unsubscribe('ready', initDefault);
	});

	gulp.task('css:update', cssHandler);

	gulp.task('dev:after:css', function () {
		gulp.watch('src/css/**/*.scss', ['css:update']);
	});

	gulp.task('build:before:css', function () {
		return (0, _del2.default)('dist/css/**');
	});
};

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

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

function getSettings(options) {
	var isUsingRem = Boolean(options.useRem);
	var isDividedBy2 = Boolean(options.divideBy2);
	var isNoHash = Boolean(options.noHash);

	var settings = [];
	if (!isNoHash) {
		settings.push((0, _postcssUrlEditor2.default)('add-version?cssSrc=src&cssDest=dist&md5=true'));
	}
	if (isUsingRem) {
		settings.push((0, _postcssPxtorem2.default)({
			rootValue: 40,
			minPixelValue: 3,
			propWhiteList: new _library2.default('pxtorem').use()()
		}));
	} else if (isDividedBy2) {
		settings.push((0, _postcssPxEditor2.default)('divide-by-two?warn=true&min=3'));
	}
	settings.push((0, _autoprefixer2.default)(['iOS >= 7', 'last 2 versions', 'Android >= 2', 'ie >= 7', 'Firefox >= 4', 'Chrome >= 4']));

	return settings;
}