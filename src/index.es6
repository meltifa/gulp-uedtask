'use strict';

import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import browserSync from 'browser-sync';
import Library from '../library';

class Task {

	constructor() {	
		this.tasks = null;
		this.defaultEndCb = [];
		this.taskNames = [];
		this.isBuild = -1 < process.argv.indexOf('build');
		this.browser = browserSync.create();
		this.gulp = this._bindGulp(gulp);
		this.ban = this.ban.bind(this);
		this.only = this.only.bind(this);
		this.run = this.run.bind(this);
		this.Library = Library;
		this.defaultEnd = this.defaultEnd.bind(this);
	}

	_bindGulp(gulp) {
		const defaultGulpTask = gulp.task.bind(gulp);
		const taskNames = this.taskNames;
		gulp.task = (name, ...args) => {
			if(0 > taskNames.indexOf('name')) {
				taskNames.push(name);
			}
			return defaultGulpTask(name, ...args);
		};
		return gulp;
	}

	_use(taskNameList, isOnly) {
		if(null === this.tasks) {
			const taskNames = Array.isArray(taskNameList) ? [...taskNameList] : [taskNameList];
			this.tasks = fs.readdirSync(__dirname + '/tasks').reduce(function(tasks, file) {
				const pathname = path.resolve(__dirname + '/tasks', file);
				if(fs.lstatSync(pathname).isFile()) {
					const name = path.parse(pathname).name;
					const isDefault = 'default' === name;
					const inList = -1 < taskNames.indexOf(name);
					const condition = isOnly ? ( !isDefault && inList ) : ( isDefault || !inList );
					if(condition) {
						const lib = require(pathname);
						const handler = ('function' === typeof lib) ? lib : ('function' === typeof lib.default ? lib.default : null);
						if(handler) {
							tasks[isDefault ? 'unshift' : 'push'](handler);
						}
					}
				}
				return tasks;
			}, []).reverse();
		}
		return this;
	}

	ban(taskNameList) {
		return this._use(taskNameList, false);
	}

	only(taskNameList) {
		return this._use(taskNameList, true);
	}

	defaultEnd(cb) {
		if('function' === typeof cb) {
			this.defaultEndCb.push(cb);
		}
		return this;
	}

	run(options, defaultTaskCb) {
		let args, cb;
		if('function' === typeof options) {
			cb = options;
			args = {};
		} else {
			args = Object(options);
			cb = defaultTaskCb;
		}
		if(null === this.tasks) {
			this.ban([]);
		}
		this.defaultEnd(cb);
		const { tasks, gulp } = this;
		tasks.forEach(task => task(gulp, args, this));
	}

}


module.exports = new Task();