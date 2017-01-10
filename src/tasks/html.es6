'use strict';

import tpl from 'gulp-html-tpl';
import juicer from 'juicer';
import posthtml from 'gulp-posthtml';
import fs from 'fs';

juicer.set('strip', false);

const iconfontScssPath = process.cwd() + '/src/css/_iconfont.scss';

const isUsingIconfont = function() {
	try {
		const isDirectory = fs.lstatSync(process.cwd() + '/src/asset/iconfont').isDirectory();
		const isFile = fs.lstatSync(iconfontScssPath).isFile();
		return isDirectory && isFile;
	} catch(e) {
		return false;
	}
};


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

function getTplSetting(options) {

	const defaultOption = {
		engine: juicer,
		data: { Math, Number, Boolean, String, Array, Object }
	};

	return Object.assign(defaultOption, options['gulp-html-tpl.html'] || options['gulp-html-tpl']);

}

export default function(gulp, options, { browser, isBuild }) {

	const tplSetting = getTplSetting(options);
	const insertIconfont = Boolean(options.insertIconfont);

	gulp.task('default:html', function() {
		const glob = [
			'src/**/*.html',
			'!src/**/_*.html',
			'!src/{asset,template}/**/*.html'
		];
		let stream = gulp.src(glob).pipe(tpl(tplSetting));
		if(insertIconfont && isUsingIconfont()) {
			stream = stream.pipe(posthtml([insertEntityToHTML()]));
		}
		return stream.pipe(gulp.dest('dist')).on('end', browser.reload);
	});

	if(!isBuild) {
		gulp.watch(['src/**/*.html', '!src/asset/**/*.html'], ['default:html']);
		if(insertIconfont) {
			gulp.watch('src/css/_iconfont.scss', ['default:html']);
		}
	}
}