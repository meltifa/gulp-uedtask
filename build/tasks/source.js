'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

exports.default = source;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _postcssUrlEditor = require('postcss-url-editor');

var _postcssUrlEditor2 = _interopRequireDefault(_postcssUrlEditor);

var _posthtmlParser = require('posthtml-parser');

var _posthtmlParser2 = _interopRequireDefault(_posthtmlParser);

var _library = require('../../library');

var _library2 = _interopRequireDefault(_library);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 是否是本地资源
// 比如 `data:image` `http:` `about:blank` 等都不是本地资源
function isLocalSource(src) {
	return src && !/^\w+:/.test(src);
}

// 解析字符串中的 url
// -webkit-image-set 里面就可能有多个 url
// background-image 也支持多个 url
// 所以返回的是个数组
function getUrlsFromCSS(css) {
	var urls = [];
	var re = /url\(\s*(["']?)([^)"']+?)\1\s*\)/g;
	while (re.test(css)) {
		var url = RegExp.$2;
		if (urls.indexOf(url) < 0) {
			urls.push(url);
		}
	}
	return urls;
}

// 检查HTML内的资源
function checkHTML(file, content) {
	var logger = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

	function check(src) {
		if (isLocalSource(src)) {
			(0, _defineProperty2.default)(logger, src, {
				value: true,
				enumerable: true,
				writable: true
			});
		}
	}

	var ast = Array.isArray(content) ? content : (0, _posthtmlParser2.default)(content);
	ast.forEach(function (node) {
		// 空字符串节点
		if (!node) {
			return;
		}
		// 字符串节点
		if (typeof node === 'string') {
			// 被注释掉的 HTML 结构也要检查
			if (/^<!--([\s\S]+)-->$/.test(node)) {
				checkHTML(file, RegExp.$1, logger);
			}
			return;
		}
		// DOM节点
		var _node$attrs = node.attrs,
		    attrs = _node$attrs === undefined ? {} : _node$attrs,
		    tag = node.tag,
		    sub = node.content;

		switch (tag) {
			case 'img':
				check(attrs.src);
				if (attrs.srcset) {
					attrs.srcset.split(',').forEach(function (src) {
						return (/(\S+)/.test(src) && check(RegExp.$1)
						);
					});
				}
				break;
			case 'script':
				check(attrs.src);
				break;
			case 'link':
				check(attrs.href);
				break;
			case 'style':
				// style.innerHTML
				if (sub) {
					getUrlsFromCSS(sub.shift()).forEach(check);
				}
				break;
			default:
				// getAttribute('style')
				if (attrs.style) {
					getUrlsFromCSS(attrs.style).forEach(check);
				}
				// 内部节点递归
				if (sub) {
					checkHTML(file, sub, logger);
				}
				break;
		}
	});

	return {
		file: file,
		sources: (0, _keys2.default)(logger)
	};
}

// 检查CSS
function checkCSS(file, content) {
	var sources = [];
	return (0, _postcss2.default)([(0, _postcssUrlEditor2.default)(function check(url) {
		if (sources.indexOf(url) < 0) {
			sources.push(url);
		}
		return url;
	})]).process(content).then(function resolve() {
		return { file: file, sources: sources };
	});
}

function source() {
	var emit = this.emit,
	    on = this.on,
	    commands = this.commands,
	    config = this.config;

	// 命令行中执行了 build 任务
	// 且不是在查看任务树的时候
	// 删除 dist 目录

	if (commands.indexOf('build') > -1 && config.T !== true && config.tasks !== true) {
		_del2.default.sync('dist/**');
	}

	// build 任务结束后检查资源
	on('task-end', function main(_ref) {
		var task = _ref.task;

		if (task !== 'build') {
			return;
		}
		var distPath = _path2.default.resolve('dist');
		// dist 目录所有文件
		var distFiles = new _library2.default(distPath).all();
		// 检查文件
		var promises = distFiles.reduce(function checkFiles(pros, file) {
			// 检查 HTML 和 CSS 文件
			if (/\.(html|css)$/i.test(file)) {
				var type = RegExp.$1.toLowerCase();
				pros.push(
				// 读取文件内容
				new _promise2.default(function readFile(resolve, reject) {
					return _fs2.default.readFile(file, function getContent(err, buffer) {
						return err ? reject(err) : resolve(buffer.toString());
					});
				}).then(function check(content) {
					return type === 'html' ? checkHTML(file, content) : checkCSS(file, content);
				}));
			}
			return pros;
		}, []);

		_promise2.default.all(promises).then(function collect(results) {
			var used = [];
			var usedKeys = {};

			results.forEach(function (result) {
				if (!result) {
					return;
				}
				var file = result.file,
				    sources = result.sources;

				sources.forEach(function (src) {
					var url = src.replace(/\\/g, '/');
					if (!isLocalSource(url)) {
						return;
					}
					var resolve = _path2.default.isAbsolute(url) ? _path2.default.resolve(distPath, url.substring(1)) : _path2.default.resolve(file, '../', url);
					var real = (0, _utils.slash)(resolve).split('?').shift();
					if (!usedKeys[real]) {
						usedKeys[real] = 1;
						used.push({ base: file, href: real });
					}
				});
			});
			var unused = distFiles.filter(function (file) {
				return !usedKeys[file] && !/\.html$/i.test(file);
			});
			var notfound = used.filter(function (_ref2) {
				var href = _ref2.href;
				return distFiles.indexOf(href) < 0;
			});
			return { unused: unused, notfound: notfound };
		}).then(function log(_ref3) {
			var unused = _ref3.unused,
			    notfound = _ref3.notfound;

			if (unused.length) {
				emit('log', {
					title: '[Check-Sources] The following files are not used:',
					content: unused.map(function (file, index) {
						return index + 1 + '. ' + file;
					}).join('\n')
				});
			}
			if (notfound.length) {
				emit('log', {
					title: '[Check-Sources] The following files are not found:',
					content: notfound.map(function (_ref4) {
						var base = _ref4.base,
						    href = _ref4.href;
						return 'Base: ' + base + '\nHref: ' + href;
					}).join('\n\n')
				});
			}
		}).catch(emit.bind(null, 'log'));
	});
}