'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.args = exports.commands = undefined;

var _yargs = require('yargs');

// task names
const commands = exports.commands = _yargs.argv._.slice();
// dynamic arguments
const args = exports.args = Object.assign({}, _yargs.argv);

// clear arguments
delete args._;
delete args.$0;