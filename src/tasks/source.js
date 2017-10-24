import fs from 'fs';
import del from 'del';
import path from 'path';
import postcss from 'postcss';
import urleditor from 'postcss-url-editor';
import HTMLParser from 'posthtml-parser';
import Library from '../../library';
import { slash } from '../utils';

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
	const urls = [];
	const re = /url\(\s*(["']?)([^)"']+?)\1\s*\)/g;
	while (re.test(css)) {
		const url = RegExp.$2;
		if (urls.indexOf(url) < 0) {
			urls.push(url);
		}
	}
	return urls;
}

// 检查HTML内的资源
function checkHTML(file, content, logger = []) {
	function check(src) {
		if (isLocalSource(src)) {
			Object.defineProperty(logger, src, {
				value: true,
				enumerable: true,
				writable: true
			});
		}
	}

	const ast = Array.isArray(content) ? content : HTMLParser(content);
	ast.forEach((node) => {
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
		const { attrs = {}, tag, content: sub } = node;
		switch (tag) {
		case 'img':
			check(attrs.src);
			if (attrs.srcset) {
				attrs.srcset.split(',').forEach(src => /(\S+)/.test(src) && check(RegExp.$1));
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
		file,
		sources: Object.keys(logger)
	};
}

// 检查CSS
function checkCSS(file, content) {
	const sources = [];
	return postcss([urleditor(function check(url) {
		if (sources.indexOf(url) < 0) {
			sources.push(url);
		}
		return url;
	})]).process(content).then(function resolve() {
		return { file, sources };
	});
}

export default function source() {
	const { emit, on, commands, config } = this;

	// 命令行中执行了 build 任务
	// 且不是在查看任务树的时候
	// 删除 dist 目录
	if (commands.indexOf('build') > -1 && config.T !== true && config.tasks !== true) {
		del.sync('dist/**');
	}

	// build 任务结束后检查资源
	on('task-end', function main({ task }) {
		if (task !== 'build') {
			return;
		}
		const distPath = path.resolve('dist');
		// dist 目录所有文件
		const distFiles = new Library(distPath).all();
		// 检查文件
		const promises = distFiles.reduce(function checkFiles(pros, file) {
			// 检查 HTML 和 CSS 文件
			if (/\.(html|css)$/i.test(file)) {
				const type = RegExp.$1.toLowerCase();
				pros.push(
					// 读取文件内容
					new Promise(function readFile(resolve, reject) {
						return fs.readFile(file, function getContent(err, buffer) {
							return err ? reject(err) : resolve(buffer.toString());
						});
					}).then(function check(content) {
						return (type === 'html')
							? checkHTML(file, content)
							: checkCSS(file, content);
					})
				);
			}
			return pros;
		}, []);

		Promise.all(promises).then(function collect(results) {
			const used = [];
			const usedKeys = {};

			results.forEach((result) => {
				if (!result) {
					return;
				}
				const { file, sources } = result;
				sources.forEach((src) => {
					const url = src.replace(/\\/g, '/');
					if (!isLocalSource(url)) {
						return;
					}
					const resolve = path.isAbsolute(url)
						? path.resolve(distPath, url.substring(1))
						: path.resolve(file, '../', url);
					const real = slash(resolve).split('?').shift();
					if (!usedKeys[real]) {
						usedKeys[real] = 1;
						used.push({ base: file, href: real });
					}
				});
			});
			const unused = distFiles.filter(file => !usedKeys[file] && !/\.html$/i.test(file));
			const notfound = used.filter(({ href }) => distFiles.indexOf(href) < 0);
			return { unused, notfound };
		}).then(function log({ unused, notfound }) {
			if (unused.length) {
				emit('log', {
					title: '[Check-Sources] The following files are not used:',
					content: unused.map((file, index) => `${index + 1}. ${file}`).join('\n')
				});
			}
			if (notfound.length) {
				emit('log', {
					title: '[Check-Sources] The following files are not found:',
					content: notfound.map(({ base, href }) => `Base: ${base}\nHref: ${href}`).join('\n\n')
				});
			}
		}).catch(emit.bind(null, 'log'));
	});
}