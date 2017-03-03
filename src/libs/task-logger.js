'use strict';

export const DEFAULT_COMMAND = 'default';
export const SORT_COMMANDS = ['dev', 'build'];
export const SIDE_HOOKS = ['before', 'after'];
export const MAIN_HOOK = 'main';

export default class TaskLogger {

	static allTasks = [];
	static commandTasks = {};

	static getCommands() {
		return this.commandTasks;
	}

	static getAllTasks() {
		return this.allTasks.slice();
	}

	static addTask(name) {
		const [ command, hook ] = name.split(':');
		const commands = this.parseCommands(command);
		if(commands.length) {
			const hooks = this.parseHooks(hook);
			this.logCommandTask({ commands, hooks, name });
		}
		this.logAllTasks(name);
	}

	static parseCommands(str = '') {
		if(DEFAULT_COMMAND === str) {
			return [ ...SORT_COMMANDS ];
		}
		return str.split(',').filter(command => -1 < SORT_COMMANDS.indexOf(command));
	}

	static parseHooks(str = '') {
		const sideHooks = str.split(',').filter(hook => -1 < SIDE_HOOKS.indexOf(hook));
		return sideHooks.length ? sideHooks : [ MAIN_HOOK ];
	}



	static logAllTasks(name) {
		const allTasks = this.allTasks;
		if(0 > allTasks.indexOf(name)) {
			allTasks.push(name);
		}
	}

	static logCommandTask({ commands, hooks, name }) {
		const commandTasks = this.commandTasks;
		for(let command of commands) {
			if(!commandTasks.hasOwnProperty(command)) {
				Object.defineProperty(commandTasks, command, {
					enumerable: true,
					value: {}
				});
			}
			const commandTask = commandTasks[command];
			for(let hook of hooks) {
				if(!commandTask.hasOwnProperty(hook)) {
					Object.defineProperty(commandTask, hook, {
						enumerable: true,
						value: []
					});
				}
				const namespace = commandTask[hook];
				if(0 > namespace.indexOf(hook)) {
					namespace.push(name);
				}
			}
		}
	}

}