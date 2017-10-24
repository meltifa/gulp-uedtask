// 所有配置类同 image 任务

import webpack from 'webpack-stream';
import babel from 'gulp-babel';
import fs from 'fs';
import path from 'path';

const babelConfig = {
	presets: [
		['env', {
			targets: {
				browsers: ['last 2 versions', 'ie >= 8']
			},
			modules: false,
			useBuiltIns: true
		}]
	],
	ignore: ['lib', '*.min.js']
};
const isUsingWebpack = fs.existsSync('./webpack.config.js', result => result);
let webpackConfig;
if (isUsingWebpack) {
	webpackConfig = require(path.join(process.cwd(), './webpack.config.js'));
}

export default function js(gulp) {
	const { config } = this;
	const src = 'src/js/**/*.js';
	if (config.minifyJS !== false) {
		babelConfig.presets.push(['minify']);
	}

	gulp.task('dev:after:js', function watch(cb) {
		this.reload(src);
		cb();
	});

	gulp.task('build:js', function compile() {
		let stream = gulp.src(src);
		if (isUsingWebpack) {
			stream = stream.pipe(webpack(webpackConfig));
		}
		return stream.pipe(babel(babelConfig))
			.pipe(gulp.dest('dist/js'));
	});
}