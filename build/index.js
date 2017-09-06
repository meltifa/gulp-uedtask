'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.gulp = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.run = run;
exports.ban = ban;
exports.only = only;
exports.include = include;

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _registry = require('./registry');

var _registry2 = _interopRequireDefault(_registry);

var _loader = require('./loader');

var loader = _interopRequireWildcard(_loader);

var _cmd = require('./cmd');

var cmd = _interopRequireWildcard(_cmd);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable import/no-extraneous-dependencies */
exports.gulp = _gulp2.default;
/* eslint-enable import/no-extraneous-dependencies */

function run(options) {
	var registry = new _registry2.default({
		commands: cmd.commands,
		config: (0, _assign2.default)({}, options, cmd.args)
	});
	var context = registry.context;
	_gulp2.default.registry(registry);
	loader.load(_gulp2.default, context);
	loader.create(_gulp2.default, context);
}

function ban() {
	loader.ban.apply(loader, arguments);
	return exports;
}

function only() {
	loader.only.apply(loader, arguments);
	return exports;
}

function include() {
	loader.include.apply(loader, arguments);
	return exports;
}