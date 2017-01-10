'use strict';

import path from 'path';
import fs from 'fs';

export function mkdirSync(directory, mode) {
	const dirpath = path.resolve(process.cwd(), directory);
	const F_OK = fs.hasOwnProperty('F_OK') ? fs.F_OK : fs.constants.F_OK;
	const deep = function(dir, cb) {
		try {
			fs.accessSync(dir, F_OK);
		} catch(e) {
			deep(path.dirname(dir), function() {
				return fs.mkdirSync(dir, mode);
			});
		}
		if('function' === typeof cb) {
			cb();
		}
	}
	return deep(dirpath);
}