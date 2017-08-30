/*eslint-disable*/
import gulp from 'gulp';
/*eslint-enable*/
import Registry from './registry';
import * as loader from './loader';
import * as cmd from './cmd';

const registry = new Registry({ commands: cmd.commands });
gulp.registry(registry);

export { gulp };

export function run(options) {
	registry.setConfig(Object.assign({}, options, cmd.args));
	const context = registry.getContext();
	loader.load(gulp, context);
	loader.create(gulp, context);
}

export function ban(...args) {
	loader.ban(...args);
	return exports;
}

export function only(...args) {
	loader.only(...args);
	return exports;
}

export function include(...args) {
	loader.include(...args);
	return exports;
}