'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.gulp = undefined;
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
	const registry = new _registry2.default({
		commands: cmd.commands,
		config: Object.assign({}, options, cmd.args)
	});
	const context = registry.context;
	_gulp2.default.registry(registry);
	loader.load(_gulp2.default, context);
	loader.create(_gulp2.default, context);
}

function ban(...args) {
	loader.ban(...args);
	return exports;
}

function only(...args) {
	loader.only(...args);
	return exports;
}

function include(...args) {
	loader.include(...args);
	return exports;
}