import gm from 'gm';
import path from 'path';
import { slash } from '../utils';

export default function sprite(gulp) {
	const { config: { useRetina }, emit } = this;
	if (!useRetina) {
		return;
	}

	function end(resolve, reject) {
		return function callback(err, data) {
			return err ? reject(err) : resolve(data);
		};
	}

	async function resize(filepath) {
		const file = path.resolve(filepath);
		let handler = gm(file);
		const { width, height } = await new Promise((succ, fail) => handler.size(end(succ, fail)));
		const wr = width % 2;
		const hr = height % 2;
		if (wr || hr) {
			handler = handler.borderColor('transparent').border(1, 1).crop(width + wr, height + hr, 1, 1);
			await new Promise((succ, fail) => handler.write(file, end(succ, fail)));
			const name = slash(path.relative(path.resolve('src/asset/sprite'), file).replace(/\.png$/, ''));
			emit('log', `Resized sprite asset: ${name}`);
		}
	}

	gulp.task('dev:after:sprite:resize', function watch(cb) {
		const watcher = gulp.watch('src/asset/sprite/**/*.png');
		watcher.on('add', resize);
		watcher.on('change', resize);
		return cb();
	});
}