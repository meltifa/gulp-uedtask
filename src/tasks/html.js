'use strict';

import tpl from 'gulp-html-tpl';
import juicer from 'juicer';
import fileIncluder from 'gulp-file-include';
import posthtml from 'gulp-posthtml';
import fs from 'fs';
import del from 'del';
import glob from 'glob';
import path from 'path';

juicer.set('strip', false);

const CWD = process.cwd();
const iconfontScssPath = CWD + '/src/css/_iconfont.scss';

function isUsingIconfont() {
	try {
		const isDirectory = fs.lstatSync(CWD + '/src/asset/iconfont').isDirectory();
		const isFile = fs.lstatSync(iconfontScssPath).isFile();
		return isDirectory && isFile;
	} catch(e) {
		return false;
	}
}

function insertEntityToHTML() {
	const icons = {};

	try {
		fs.readFileSync(iconfontScssPath).toString().match(/\$__iconfont__data([\s\S]*?)\);/)[1].replace(/"([^"]+)":\s"([^"]+)",/g, function(_, name, entity) {
			Object.defineProperty(icons, name.toLowerCase(), {
				enumerable: true,
				value: entity.slice(1).toLowerCase()
			});
		});
	} catch(e) {}

	return function(tree) {
		tree.match({ tag: 'i' }, function(node) {
			const attrs = node.attrs;
			if(attrs) {
				const classText = attrs.class;
				const exec = /\b_i-([\w-]+)/.exec(classText);
				if(exec) {
					const name = exec[1].toLowerCase();
					if(icons.hasOwnProperty(name)) {
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
	let files = glob.sync('src/**/*.html').filter(function(file) {
		return !/[\\/]_[^.\\/]\.html$/i.test(file) && !/src(\\|\/)(asset|template)\1/.test(file);
	});
	const logger = files.reduce(function(obj, file) {
		const dir = path.parse(file).dir.replace(/\\/g, '/');
		const relative = path.relative(CWD, dir);
		if(relative) {
			obj[relative] = true;
		}
		return obj;
	}, Object.create(null));
	return Object.keys(logger);
}

export default function(options, { gulp }) {

	const insertIconfont = Boolean(options.insertIconfont);

	gulp.task('default:html', function() {
		let stream = gulp.src([
			'src/**/*.html',
			'!src/**/_*.html',
			'!src/{asset,template}/**/*.html'
        ])
        .pipe(fileIncluder())
        .pipe(tpl({
			engine: juicer,
			data: { Math, Number, Boolean, String, Array, Object, JSON, RegExp, Date }
		}));
		if(insertIconfont && isUsingIconfont()) {
			stream = stream.pipe(posthtml([insertEntityToHTML()]));
		}
		return stream.pipe(gulp.dest('dist'));
	});

	gulp.task('dev:after:html', function() {
		gulp.watch(['src/**/*.html', '!src/asset/**/*.html'], ['default:html']);
		if(insertIconfont) {
			gulp.watch('src/css/_iconfont.scss', ['default:html']);
		}
	});

	gulp.task('build:before:html', function() {
		const pattern = getHTMLDirs().map(dir => dir.replace(/^src((?=[\\/])|$)/, 'dist') + '/*.html');
		return del(pattern);
	});
}