// 所有配置类同 image 任务

import uglify from 'gulp-uglify';
import gulpif from 'gulp-if';

export default function js(gulp) {
	const { config } = this;
	const src = 'src/js/**/*.js';

	function isCompress({ path }) {
		return !(/\.min\.js$/i.test(path) || config.minifyJS === false);
	}

	gulp.task('dev:after:js', function watch(cb) {
		this.reload(src);
		cb();
	});

	gulp.task('build:js', function compile() {
		return gulp.src(src)
			.pipe(gulpif(isCompress, uglify()))
			.pipe(gulp.dest('dist/js'));
	});
}