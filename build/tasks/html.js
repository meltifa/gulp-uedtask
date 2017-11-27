'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (options, {
	gulp
}) {

	const insertIconfont = Boolean(options.insertIconfont);
	const htmlSrc = ['src/**/*.html', '!src/**/_*.html', '!src/{asset,template,inc}/**/*.html'];
	const templateSrc = ['src/**/_*.html', 'src/{template,inc}/**/*.html'];
	const tplData = {
		engine: _juicer2.default,
		dataTag: 'data',
		data: {
			Math,
			Number,
			Boolean,
			String,
			Array,
			Object,
			JSON,
			RegExp,
			Date
		}
	};

	gulp.task('default:html', function () {
		let stream = gulp.src(htmlSrc).pipe((0, _gulpNewer2.default)('dist')).pipe((0, _gulpFileInclude2.default)()).on('error', function (err) {
			_gulpUtil2.default.log('fileIncluder Error!', err.message);
			this.end();
		}).pipe((0, _gulpHtmlTpl2.default)(tplData));
		if (insertIconfont && isUsingIconfont()) {
			stream = stream.pipe((0, _gulpPosthtml2.default)([insertEntityToHTML()]));
		}
		return stream.pipe(gulp.dest('dist'));
	});

	gulp.task('html:update', function () {
		let stream = gulp.src(htmlSrc).pipe((0, _gulpFileInclude2.default)()).on('fileIncluder', function (err) {
			_gulpUtil2.default.log('fileIncluder Error!', err.message);
			this.end();
		}).pipe((0, _gulpHtmlTpl2.default)(tplData));
		if (insertIconfont && isUsingIconfont()) {
			stream = stream.pipe((0, _gulpPosthtml2.default)([insertEntityToHTML()]));
		}
		return stream.pipe(gulp.dest('dist'));
	});

	gulp.task('dev:after:html', function () {
		gulp.watch(htmlSrc, ['default:html']);
		gulp.watch(templateSrc, ['html:update']);
		if (insertIconfont) {
			gulp.watch('src/css/_iconfont.scss', ['html:update']);
		}
	});

	gulp.task('build:before:html', function () {
		const pattern = getHTMLDirs().map(dir => dir.replace(/^src((?=[\\/])|$)/, 'dist') + '/*.html');
		return (0, _del2.default)(pattern);
	});
};

var _gulpHtmlTpl = require('gulp-html-tpl');

var _gulpHtmlTpl2 = _interopRequireDefault(_gulpHtmlTpl);

var _juicer = require('juicer');

var _juicer2 = _interopRequireDefault(_juicer);

var _gulpFileInclude = require('gulp-file-include');

var _gulpFileInclude2 = _interopRequireDefault(_gulpFileInclude);

var _gulpPosthtml = require('gulp-posthtml');

var _gulpPosthtml2 = _interopRequireDefault(_gulpPosthtml);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _gulpNewer = require('gulp-newer');

var _gulpNewer2 = _interopRequireDefault(_gulpNewer);

var _gulpUtil = require('gulp-util');

var _gulpUtil2 = _interopRequireDefault(_gulpUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_juicer2.default.set('strip', false);

const CWD = process.cwd();
const iconfontScssPath = CWD + '/src/css/_iconfont.scss';

function isUsingIconfont() {
	try {
		const isDirectory = _fs2.default.lstatSync(CWD + '/src/asset/iconfont').isDirectory();
		const isFile = _fs2.default.lstatSync(iconfontScssPath).isFile();
		return isDirectory && isFile;
	} catch (e) {
		return false;
	}
}

function insertEntityToHTML() {
	const icons = {};

	try {
		_fs2.default.readFileSync(iconfontScssPath).toString().match(/\$__iconfont__data([\s\S]*?)\);/)[1].replace(/"([^"]+)":\s"([^"]+)",/g, function (_, name, entity) {
			Object.defineProperty(icons, name.toLowerCase(), {
				enumerable: true,
				value: entity.slice(1).toLowerCase()
			});
		});
	} catch (e) {}

	return function (tree) {
		tree.match({
			tag: 'i'
		}, function (node) {
			const attrs = node.attrs;
			if (attrs) {
				const classText = attrs.class;
				const exec = /\b_i-([\w-]+)/.exec(classText);
				if (exec) {
					const name = exec[1].toLowerCase();
					if (icons.hasOwnProperty(name)) {
						node.attrs.class = classText.replace(exec[0], '').replace(/\s+/g, ' ').trim();
						node.content = ['&#x' + icons[name] + ';'];
					}
				}
			}
			return node;
		});
		return tree;
	};
}

function getHTMLDirs() {
	let files = _glob2.default.sync('src/**/*.html').filter(function (file) {
		return !/[\\/]_[^.\\/]\.html$/i.test(file) && !/src(\\|\/)(asset|template)\1/.test(file);
	});
	const logger = files.reduce(function (obj, file) {
		const dir = _path2.default.parse(file).dir.replace(/\\/g, '/');
		const relative = _path2.default.relative(CWD, dir);
		if (relative) {
			obj[relative] = true;
		}
		return obj;
	}, Object.create(null));
	return Object.keys(logger);
}