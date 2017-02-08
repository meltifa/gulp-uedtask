'use strict';

import fs from 'fs';
import path from 'path';
import del from 'del';
import runSequence from 'run-sequence';
import HTMLParser from 'posthtml-parser';
import Library from '../../library';
import postcss from 'postcss';
import urleditor from 'postcss-url-editor';
import { log, colors } from 'gulp-util';

export default function(gulp) {

	gulp.task('build:clear_dist', function() {
		return del('dist/**');
	});

	gulp.task('build:clear_temp', function() {
		return del('.temp/**');
	});

	gulp.task('build:check_sources', function() {

		function getUrlsFromCSS(css) {
			const urls = [];
			String(css).replace(/url\(\s*(["']?)([^)"']+?)\1\s*\)/g, function(_, q, url) {
				if(0 > urls.indexOf(url)) {
					urls.push(url);
				}
			});
			return urls;
		}

		function checkHTML(file, content, logger = []) {
			const ast = Array.isArray(content) ? content : HTMLParser(content);
			ast.reduce(function(logger, node) {
				if(!node) {
					return logger;
				}
				if('string' === typeof node) {
					const exec = /^<!--([\s\S]+)-->$/.exec(node);
					if(exec) {
						checkHTML(file, exec[1], logger);
					}
					return logger;
				}
				const { attrs = {}, tag, content: sub } = node;
				switch(tag) {
					case 'img':
						if(attrs.src) {
							logger[attrs.src] = true;
						} else if(attrs.srcset) {
							attrs.srcset.split(',').reduce(function(logger, src) {
								const exec = /\S+/.exec(src);
								if(exec) {
									logger[exec[0]] = true;
								}
								return logger;
							}, logger);
						}
					break;
					case 'script':
						if(attrs.src) {
							logger[attrs.src] = true;
						}
					break;
					case 'link':
						if(attrs.href) {
							logger[attrs.href] = true;
						}
					break;
					case 'style':
						if(sub) {
							getUrlsFromCSS(sub.shift()).reduce(function(logger, url) {
								logger[url] = true;
								return logger;
							}, logger);
						}
					break;
					default:
						if(attrs.style) {
							getUrlsFromCSS(attrs.style).reduce(function(logger, url) {
								logger[url] = true;
								return logger;
							}, logger);
						}
						if(sub) {
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
			return postcss([urleditor(function(url) {
				if(-1 === sources.indexOf(url)) {
					sources.push(url);
				}
				return url;
			})]).process(content).then(function() {
				return { file, sources };
			});
		}

		const CWD = process.cwd();
		const rootPath = CWD + '/dist';
		const distFiles = new Library(rootPath).all();
		const promises = distFiles.reduce(function(pros, file) {
			const exec = /\.(html|css)$/i.exec(file);
			if(exec) {
				pros.push(
					new Promise(function(resolve, reject) {
						return fs.readFile(file, function(err, buffer) {
							return err ? reject(err) : resolve(buffer.toString());
						});
					})
					.then(function(content) {
						return ('html' === exec[1].toLowerCase())
							? checkHTML(file, content)
							: checkCSS(file, content);
					})
					.catch(() => log('[' + colors.yellow('check-sources') + '] File unreadable: ' + path.relative(CWD, file)))
				);
			}
			return pros;
		}, []);

		return Promise.all(promises).then(function(results) {

			const usedSources = [];
			usedSources.files = {};

			results.reduce(function(usedSources, result) {
				if(!result) {
					return usedSources;
				}
				const { file, sources } = result;
				return sources.reduce(function(usedSources, source) {
					const src = source.replace(/\\/g, '/');
					if(/^(https?:)?\/\//i.test(src)) {
						return usedSources;
					}
					let realPath;
					if(0 === src.indexOf('/')) {
						realPath = path.resolve(rootPath, src.substring(1));
					} else {
						realPath = path.resolve(file, '../', src);
					}
					realPath = realPath.replace(/\\/g, '/').split('?').shift();
					if(-1 === usedSources.indexOf(realPath)) {
						usedSources.push({ base: file, href: realPath });
						usedSources.files[realPath] = true;
					}
					return usedSources;
				}, usedSources);
			}, usedSources);

			const unusedSources = distFiles.filter(function(file) {
				return !usedSources.files.hasOwnProperty(file) && !/\.html$/i.test(file);
			});

			const notFoundSources = usedSources.filter(function({ href }) {
				return -1 === distFiles.indexOf(href);
			});

			return { usedSources, unusedSources, notFoundSources };

		}).then(function({ unusedSources, notFoundSources }) {

			if(unusedSources.length) {
				log('[' + colors.yellow('Check-Sources') + '] The following files are not used:');
				unusedSources.forEach((file, index) => console.log('  ' + (index + 1) + '. ' + path.relative(CWD, file)));
			}

			if(notFoundSources.length) {
				log('[' + colors.yellow('Check-Sources') + '] The following files are not found:');
				notFoundSources.forEach(({ base, href}, index) => console.log('  ' + (index + 1) + '. ' + 
					colors.yellow('Base') + ': ' + path.relative(CWD, base) + '. ' + 
					colors.yellow('Href') + ': ' + path.relative(CWD, href)
				));
			}

		});
	});

	gulp.task('build', function(cb) {
		runSequence('build:clear_dist', 'default', 'build:clear_temp', 'build:check_sources', cb);
	});

}