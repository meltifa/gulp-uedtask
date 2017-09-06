/* eslint-disable import/no-extraneous-dependencies */
import gulp from 'gulp';
/* eslint-enable import/no-extraneous-dependencies */
import Registry from './registry';
import * as loader from './loader';
import * as cmd from './cmd';

export { gulp };

export function run(options) {
	const registry = new Registry({
		commands: cmd.commands,
		config: Object.assign({}, options, cmd.args)
	});
	const context = registry.context;
	gulp.registry(registry);
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