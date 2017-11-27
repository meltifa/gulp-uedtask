'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _yargs = require('yargs');

var _taskLogger = require('./task-logger');

const tasks = _yargs.argv._;
const commands = tasks.filter(task => -1 < _taskLogger.SORT_COMMANDS.indexOf(task));
if (!tasks.length) {
	throw new Error('Task Undefined!');
}

const parameters = Object.assign({}, _yargs.argv);
delete parameters.$0;
delete parameters._;

exports.default = { tasks, commands, parameters };