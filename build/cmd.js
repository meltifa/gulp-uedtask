'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.args = exports.commands = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _yargs = require('yargs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// task names
var commands = exports.commands = _yargs.argv._.slice();
// dynamic arguments
var args = exports.args = (0, _assign2.default)({}, _yargs.argv);

// clear arguments
delete args._;
delete args.$0;