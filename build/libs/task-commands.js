'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _yargs = require('yargs');

var _taskLogger = require('./task-logger');

var tasks = _yargs.argv._;
var commands = tasks.filter(function (task) {
	return -1 < _taskLogger.SORT_COMMANDS.indexOf(task);
});
if (!tasks.length) {
	throw new Error('Task Undefined!');
}

var parameters = Object.assign({}, _yargs.argv);
delete parameters.$0;
delete parameters._;

exports.default = { tasks: tasks, commands: commands, parameters: parameters };