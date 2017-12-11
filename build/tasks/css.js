'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (options, {
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
				return gulp.src('src/css/**/*.scss').pipe((0, _gulpNewer2.default)({
					dest: 'dist/css',
					ext: '.css',
					extra: '**/_*.scss'
				})).pipe((0, _gulpSass2.default)({
					outputStyle,
					includePaths: [new _library2.default('scss').cwd(), process.cwd() + '/src/css/sprite']
				})).on('error', _gulpSass2.default.logError).pipe(gulp.dest('dist/css')).pipe((0, _gulpPostcss2.default)(settings)).pipe(gulp.dest('dist/css')).on('end', resolve);
			}, 200);
		}).catch(function (e) {
			return console.warn(e.messageFormatted);
		});
	};

	TaskListener.subscribe('ready', function initDefault() {
		const allTasks = TaskLogger.getAllTasks();
		const defaultDeps = ['default:sprite', 'default:image', 'default:webfont', 'default:iconfont'];
		const dependencies = defaultDeps.filter(dep => allTasks.indexOf(dep) > -1);
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

var _postcssAssets = require('postcss-assets');

var _postcssAssets2 = _interopRequireDefault(_postcssAssets);

var _postcssUrlEditor = require('postcss-url-editor');

var _postcssUrlEditor2 = _interopRequireDefault(_postcssUrlEditor);

var _postcssPxEditor = require('postcss-px-editor');

var _postcssPxEditor2 = _interopRequireDefault(_postcssPxEditor);

var _library = require('../../library');

var _library2 = _interopRequireDefault(_library);

var _gulpNewer = require('gulp-newer');

var _gulpNewer2 = _interopRequireDefault(_gulpNewer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSettings(options) {
	const isDivideBy2 = Boolean(options.divideBy2);
	const isUsingRem = Boolean(options.useRem);
	const isNoHash = Boolean(options.noHash);
	const rootValue = parseInt(options.rootValue, 10) || 40;

	const settings = [];

	if (isUsingRem) {
		settings.push((0, _postcssPxtorem2.default)({
			rootValue,
			minPixelValue: 3,
			propWhiteList: new _library2.default('pxtorem').use()()
		}));
	} else if (isDivideBy2) {
		settings.push((0, _postcssPxEditor2.default)('divide-by-two?warn=true&min=3'));
	}
	settings.push((0, _autoprefixer2.default)(['iOS >= 8', 'last 2 versions', 'Android >= 4', 'ie >= 9']), (0, _postcssAssets2.default)({
		relative: true,
		loadPaths: ['dist/images/sprite', 'dist/img/sprite']
	}));
	if (!isNoHash) {
		settings.push((0, _postcssUrlEditor2.default)('add-version?cssSrc=src&cssDest=dist&md5=true'));
	}

	return settings;
}