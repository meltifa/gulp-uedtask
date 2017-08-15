'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (options, _ref) {
	var gulp = _ref.gulp;


	var insertIconfont = Boolean(options.insertIconfont);
	var htmlSrc = ['src/**/*.html', '!src/**/_*.html', '!src/{asset,template,inc}/**/*.html'];
	var templateSrc = ['src/**/_*.html', 'src/{template,inc}/**/*.html'];
	var tplData = {
		engine: _juicer2.default,
		data: {
			Math: Math,
			Number: Number,
			Boolean: Boolean,
			String: String,
			Array: Array,
			Object: Object,
			JSON: JSON,
			RegExp: RegExp,
			Date: Date
		}
	};

	gulp.task('default:html', function () {
		var stream = gulp.src(htmlSrc).pipe((0, _gulpNewer2.default)('dist')).pipe((0, _gulpFileInclude2.default)()).pipe((0, _gulpHtmlTpl2.default)(tplData));
		if (insertIconfont && isUsingIconfont()) {
			stream = stream.pipe((0, _gulpPosthtml2.default)([insertEntityToHTML()]));
		}
		return stream.pipe(gulp.dest('dist'));
	});

	gulp.task('html:update', function () {
		var stream = gulp.src(htmlSrc).pipe((0, _gulpFileInclude2.default)()).pipe((0, _gulpHtmlTpl2.default)(tplData));
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
		var pattern = getHTMLDirs().map(function (dir) {
			return dir.replace(/^src((?=[\\/])|$)/, 'dist') + '/*.html';
		});
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_juicer2.default.set('strip', false);

var CWD = process.cwd();
var iconfontScssPath = CWD + '/src/css/_iconfont.scss';

function isUsingIconfont() {
	try {
		var isDirectory = _fs2.default.lstatSync(CWD + '/src/asset/iconfont').isDirectory();
		var isFile = _fs2.default.lstatSync(iconfontScssPath).isFile();
		return isDirectory && isFile;
	} catch (e) {
		return false;
	}
}

function insertEntityToHTML() {
	var icons = {};

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
			var attrs = node.attrs;
			if (attrs) {
				var classText = attrs.class;
				var exec = /\b_i-([\w-]+)/.exec(classText);
				if (exec) {
					var name = exec[1].toLowerCase();
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
	var files = _glob2.default.sync('src/**/*.html').filter(function (file) {
		return !/[\\/]_[^.\\/]\.html$/i.test(file) && !/src(\\|\/)(asset|template)\1/.test(file);
	});
	var logger = files.reduce(function (obj, file) {
		var dir = _path2.default.parse(file).dir.replace(/\\/g, '/');
		var relative = _path2.default.relative(CWD, dir);
		if (relative) {
			obj[relative] = true;
		}
		return obj;
	}, Object.create(null));
	return Object.keys(logger);
}