'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _yargs = require('yargs');

var _taskLogger = require('./task-logger');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tasks = _yargs.argv._;
var commands = tasks.filter(function (task) {
	return -1 < _taskLogger.SORT_COMMANDS.indexOf(task);
});
if (!tasks.length) {
	throw new Error('Task Undefined!');
}

var parameters = (0, _assign2.default)({}, _yargs.argv);
delete parameters.$0;
delete parameters._;

exports.default = { tasks: tasks, commands: commands, parameters: parameters };