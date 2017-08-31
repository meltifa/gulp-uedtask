// 所有配置类同 image 任务

import uglify from 'gulp-uglify';
import gulpif from 'gulp-if';

function isCompress({ path }) {
	return !/\.min\.js$/i.test(path);
}

export default function js(gulp) {
	const src = 'src/js/**/*.js';

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