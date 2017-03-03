'use strict';

import { argv } from 'yargs';
import { SORT_COMMANDS } from './task-logger';

const tasks = argv._;
const commands = tasks.filter(task => -1 < SORT_COMMANDS.indexOf(task));
if(!tasks.length) {
	throw new Error('Task Undefined!');
}

const parameters = Object.assign({}, argv);
delete parameters.$0;
delete parameters._;

export default { tasks, commands, parameters };