'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (options, { gulp }) {

	function getUrlsFromCSS(css) {
		const urls = [];
		String(css).replace(/url\(\s*(["']?)([^)"']+?)\1\s*\)/g, function (_, q, url) {
			if (0 > urls.indexOf(url)) {
				urls.push(url);
			}
		});
		return urls;
	}

	function checkHTML(file, content, logger = []) {
		const ast = Array.isArray(content) ? content : (0, _posthtmlParser2.default)(content);
		ast.reduce(function (logger, node) {
			if (!node) {
				return logger;
			}
			if ('string' === typeof node) {
				const exec = /^<!--([\s\S]+)-->$/.exec(node);
				if (exec) {
					checkHTML(file, exec[1], logger);
				}
				return logger;
			}
			const { attrs = {}, tag, content: sub } = node;
			switch (tag) {
				case 'img':
					if (isLocalSource(attrs.src)) {
						logger[attrs.src] = true;
					}
					if (attrs.srcset) {
						attrs.srcset.split(',').reduce(function (logger, src) {
							const exec = /\S+/.exec(src);
							if (exec && isLocalSource(exec[0])) {
								logger[exec[0]] = true;
							}
							return logger;
						}, logger);
					}
					break;
				case 'script':
					if (isLocalSource(attrs.src)) {
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
							if (isLocalSource(url)) {
								logger[url] = true;
							}
							return logger;
						}, logger);
					}
					break;
				default:
					if (attrs.style) {
						getUrlsFromCSS(attrs.style).reduce(function (logger, url) {
							if (isLocalSource(url)) {
								logger[url] = true;
							}
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
			file,
			sources: Object.keys(logger)
		};
	}

	function checkCSS(file, content) {
		const sources = [];
		return (0, _postcss2.default)([(0, _postcssUrlEditor2.default)(function (url) {
			if (-1 === sources.indexOf(url)) {
				sources.push(url);
			}
			return url;
		})]).process(content).then(function () {
			return { file, sources };
		});
	}

	const CWD = process.cwd();
	const rootPath = CWD + '/dist';

	gulp.task('build:after:sources', function () {

		const distFiles = new _library2.default(rootPath).all();

		const promises = distFiles.reduce(function (pros, file) {
			const exec = /\.(html|css)$/i.exec(file);
			if (exec) {
				pros.push(new Promise(function (resolve, reject) {
					return _fs2.default.readFile(file, function (err, buffer) {
						return err ? reject(err) : resolve(buffer.toString());
					});
				}).then(function (content) {
					return 'html' === exec[1].toLowerCase() ? checkHTML(file, content) : checkCSS(file, content);
				}).catch(() => (0, _gulpUtil.log)('[' + _gulpUtil.colors.yellow('check-sources') + '] File unreadable: ' + _path2.default.relative(CWD, file))));
			}
			return pros;
		}, []);

		return Promise.all(promises).then(function (results) {
			return new Promise(function (resolve) {
				return setTimeout(function () {
					return resolve(results);
				}, 500);
			});
		}).then(function (results) {
			const usedSources = [];
			usedSources.files = {};
			results.reduce(function (usedSources, result) {
				if (!result) {
					return usedSources;
				}
				const { file, sources } = result;
				return sources.reduce(function (usedSources, source) {
					const src = source.replace(/\\/g, '/');
					if (/^(https?:)?\/\//i.test(src)) {
						return usedSources;
					}
					let realPath;
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

			const unusedSources = distFiles.filter(function (file) {
				return !usedSources.files.hasOwnProperty(file) && !/\.html$/i.test(file);
			});

			const notFoundSources = usedSources.filter(function ({ href }) {
				return -1 === distFiles.indexOf(href);
			});

			return { usedSources, unusedSources, notFoundSources };
		}).then(function ({ unusedSources, notFoundSources }) {
			if (unusedSources.length) {
				(0, _gulpUtil.log)('[' + _gulpUtil.colors.yellow('Check-Sources') + '] The following files are not used:');
				unusedSources.forEach((file, index) => console.log('  ' + (index + 1) + '. ' + _path2.default.relative(CWD, file)));
			}

			if (notFoundSources.length) {
				(0, _gulpUtil.log)('[' + _gulpUtil.colors.yellow('Check-Sources') + '] The following files are not found:');
				notFoundSources.forEach(({ base, href }, index) => console.log('  ' + (index + 1) + '. ' + _gulpUtil.colors.yellow('Base') + ': ' + _path2.default.relative(CWD, base) + '. ' + _gulpUtil.colors.yellow('Href') + ': ' + _path2.default.relative(CWD, href)));
			}
		}).catch(console.warn);
	});
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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

function isLocalSource(src) {
	return src && !/^(data|https?|about):/.test(src);
}