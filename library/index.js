var PATH = require('path');
var FS = require('fs');

var BASEPATH = __dirname + '/library/';

var repSlash = function(str) {
	return str.replace(/\\/g, '/');
};

var readdirDeep = function(path) {
	return FS.readdirSync(path).reduce(function(container, file) {
		var pathname = path + '/' + file;
		var lstat = FS.lstatSync(pathname);
		if(lstat) {
			if(lstat.isDirectory()) {
				container = container.concat(readdirDeep(pathname));
			} else {
				container.push(pathname);
			}
		}
		return container;
	}, []).map(repSlash);
};

var addREslashes = function(str) {
	var add = function(char) {
		return '\\' + char;
	};
	var chars = Array.from('!$*()-+{}[]\\.?/').map(add).join('|');
	return str.replace(new RegExp(chars, 'g'), add);
};;

var Library = function(path) {
	var base = PATH.resolve(BASEPATH, path);
	this.files = readdirDeep(base);
	this.base = repSlash(base);
};

Library.prototype = {
	constructor: Library,
	use: function(name) {
		var mod = this.get(name || 'index.js').shift();
		var exp;
		if(mod) {
			try{
				exp = require(mod);
			} catch(e) {

			}
		}
		return exp || {};
	},
	all: function() {
		return this.files.map(function(path) {
			return path;
		});
	},
	get: function() {
		var source = Array.from(arguments).join('|');
		var re = new RegExp(addREslashes(source), 'i');
		var base = this.base + '/';
		return this.files.filter(function(file) {
			var filename = file.replace(base, '');
			return re.test(filename);
		});
	},
	cwd: function() {
		return this.base;
	}
};

module.exports = Library;