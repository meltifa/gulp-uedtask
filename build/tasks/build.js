'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (gulp) {

	gulp.task('build:clear_dist', function () {
		return (0, _del2.default)('dist/**');
	});

	gulp.task('build:clear_temp', function () {
		return (0, _del2.default)('.temp/**');
	});

	gulp.task('build:check_sources', function () {

		function getUrlsFromCSS(css) {
			var urls = [];
			String(css).replace(/url\(\s*(["']?)([^)"']+?)\1\s*\)/g, function (_, q, url) {
				if (0 > urls.indexOf(url)) {
					urls.push(url);
				}
			});
			return urls;
		}

		function checkHTML(file, content) {
			var logger = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

			var ast = Array.isArray(content) ? content : (0, _posthtmlParser2.default)(content);
			ast.reduce(function (logger, node) {
				if (!node) {
					return logger;
				}
				if ('string' === typeof node) {
					var exec = /^<!--([\s\S]+)-->$/.exec(node);
					if (exec) {
						checkHTML(file, exec[1], logger);
					}
					return logger;
				}
				var _node$attrs = node.attrs,
				    attrs = _node$attrs === undefined ? {} : _node$attrs,
				    tag = node.tag,
				    sub = node.content;

				switch (tag) {
					case 'img':
						if (attrs.src) {
							logger[attrs.src] = true;
						} else if (attrs.srcset) {
							attrs.srcset.split(',').reduce(function (logger, src) {
								var exec = /\S+/.exec(src);
								if (exec) {
									logger[exec[0]] = true;
								}
								return logger;
							}, logger);
						}
						break;
					case 'script':
						if (attrs.src) {
							logger[attrs.src] = true;
						}
						break;
					case 'link':
						if (attrs.href) {
							logger[attrs.href] = true;
						}
						break;
					case 'style':
						if (sub) {
							getUrlsFromCSS(sub.shift()).reduce(function (logger, url) {
								logger[url] = true;
								return logger;
							}, logger);
						}
						break;
					default:
						if (attrs.style) {
							getUrlsFromCSS(attrs.style).reduce(function (logger, url) {
								logger[url] = true;
								return logger;
							}, logger);
						}
						if (sub) {
							checkHTML(file, sub, logger);
						}
						break;
				}
				return logger;
			}, logger);

			return {
				file: file,
				sources: Object.keys(logger)
			};
		}

		function checkCSS(file, content) {
			var sources = [];
			return (0, _postcss2.default)([(0, _postcssUrlEditor2.default)(function (url) {
				if (-1 === sources.indexOf(url)) {
					sources.push(url);
				}
				return url;
			})]).process(content).then(function () {
				return { file: file, sources: sources };
			});
		}

		var CWD = process.cwd();
		var rootPath = CWD + '/dist';
		var distFiles = new _library2.default(rootPath).all();
		var promises = distFiles.reduce(function (pros, file) {
			var exec = /\.(html|css)$/i.exec(file);
			if (exec) {
				pros.push(new Promise(function (resolve, reject) {
					return _fs2.default.readFile(file, function (err, buffer) {
						return err ? reject(err) : resolve(buffer.toString());
					});
				}).then(function (content) {
					return 'html' === exec[1].toLowerCase() ? checkHTML(file, content) : checkCSS(file, content);
				}).catch(function () {
					return (0, _gulpUtil.log)('[' + _gulpUtil.colors.yellow('check-sources') + '] File unreadable: ' + _path2.default.relative(CWD, file));
				}));
			}
			return pros;
		}, []);

		return Promise.all(promises).then(function (results) {

			var usedSources = [];
			usedSources.files = {};

			results.reduce(function (usedSources, result) {
				if (!result) {
					return usedSources;
				}
				var file = result.file,
				    sources = result.sources;

				return sources.reduce(function (usedSources, source) {
					var src = source.replace(/\\/g, '/');
					if (/^(https?:)?\/\//i.test(src)) {
						return usedSources;
					}
					var realPath = void 0;
					if (0 === src.indexOf('/')) {
						realPath = _path2.default.resolve(rootPath, src.substring(1));
					} else {
						realPath = _path2.default.resolve(file, '../', src);
					}
					realPath = realPath.replace(/\\/g, '/').split('?').shift();
					if (-1 === usedSources.indexOf(realPath)) {
						usedSources.push({ base: file, href: realPath });
						usedSources.files[realPath] = true;
					}
					return usedSources;
				}, usedSources);
			}, usedSources);

			var unusedSources = distFiles.filter(function (file) {
				return !usedSources.files.hasOwnProperty(file) && !/\.html$/i.test(file);
			});

			var notFoundSources = usedSources.filter(function (_ref) {
				var href = _ref.href;

				return -1 === distFiles.indexOf(href);
			});

			return { usedSources: usedSources, unusedSources: unusedSources, notFoundSources: notFoundSources };
		}).then(function (_ref2) {
			var unusedSources = _ref2.unusedSources,
			    notFoundSources = _ref2.notFoundSources;


			if (unusedSources.length) {
				(0, _gulpUtil.log)('[' + _gulpUtil.colors.yellow('Check-Sources') + '] The following files are not used:');
				unusedSources.forEach(function (file, index) {
					return console.log('  ' + (index + 1) + '. ' + _path2.default.relative(CWD, file));
				});
			}

			if (notFoundSources.length) {
				(0, _gulpUtil.log)('[' + _gulpUtil.colors.yellow('Check-Sources') + '] The following files are not found:');
				notFoundSources.forEach(function (_ref3, index) {
					var base = _ref3.base,
					    href = _ref3.href;
					return console.log('  ' + (index + 1) + '. ' + _gulpUtil.colors.yellow('Base') + ': ' + _path2.default.relative(CWD, base) + '. ' + _gulpUtil.colors.yellow('Href') + ': ' + _path2.default.relative(CWD, href));
				});
			}
		});
	});

	gulp.task('build', function (cb) {
		(0, _runSequence2.default)('build:clear_dist', 'default', 'build:clear_temp', 'build:check_sources', cb);
	});
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _runSequence = require('run-sequence');

var _runSequence2 = _interopRequireDefault(_runSequence);

var _posthtmlParser = require('posthtml-parser');

var _posthtmlParser2 = _interopRequireDefault(_posthtmlParser);

var _library = require('../../library');

var _library2 = _interopRequireDefault(_library);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _postcssUrlEditor = require('postcss-url-editor');

var _postcssUrlEditor2 = _interopRequireDefault(_postcssUrlEditor);

var _gulpUtil = require('gulp-util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }