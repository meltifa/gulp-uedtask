'use strict';

const fs = require('fs');

function toSCSS(data) {
	return JSON.stringify(data, null, '\t').replace(/\{/g, '(').replace(/\}/g, ')');
}

function parseSprites(options, sprites) {
	const byDir = options.byDir;
	const data = sprites.reduce(function (logger, sprite) {
		const filename = sprite.name;
		const width = sprite.width;
		const height = sprite.height;
		const total_width = sprite.total_width;
		const total_height = sprite.total_height;
		const offset_x = sprite.offset_x;
		const offset_y = sprite.offset_y;
		const escaped_image = sprite.escaped_image;

		let group;
		if (byDir) {
			group = sprite.source_image.replace(/\\/g, '/').match(/\/([^\/]+)\/[^\/]+$/)[1];
		} else {
			const hyphen = filename.indexOf('-');
			group = (0 < hyphen) ? filename.substring(0, hyphen) : 'default';
		}
		const retina = filename.indexOf('@');
		const name = (0 < retina) ? filename.substring(0, retina) : filename;
		if (!logger.hasOwnProperty(group)) {
			logger[group] = Object.create(null);
		}
		const offset_x_pct = offset_x ? (offset_x / (width - total_width) * 100).toFixed(4) + '%' : 0;
		const offset_y_pct = offset_y ? (offset_y / (height - total_height) * 100).toFixed(4) + '%' : 0;
		logger[group][name] = {
			name: name,
			width: width,
			height: height,
			offset_x: offset_x,
			offset_y: offset_y,
			total_width: total_width,
			total_height: total_height,
			escaped_image: escaped_image,
			offset_x_pct: offset_x_pct,
			offset_y_pct: offset_y_pct,
			x: offset_x,
			y: offset_y,
			x_pct: offset_x_pct,
			y_pct: offset_y_pct,
			url: escaped_image
		};
		return logger;
	}, {});
	return toSCSS(data);
}


function dataHandler(options, data) {
	const css = [];
	css.push('$__sprite-is-rem__: ' + Boolean(options.isRem && data.retina_sprites) + ';');
	css.push('$__sprite-only-retina__: ' + Boolean(options.isOnlyRetina) + ';');
	css.push('$__sprite-local-group__: ' + parseSprites(options, data.sprites) + ';');
	if (data.retina_sprites) {
		css.push('$__sprite-local-group-2x__: ' + parseSprites(options, data.retina_sprites) + ';');
	}
	css.push(fs.readFileSync(__dirname + '/lib/function.scss').toString());
	return css.join('\n');
}

const defaultOptions = {
	byDir: false,
	isRem: false,
	isOnlyRetina: false
};

module.exports = function (arg) {
	const data = Object(arg);
	if (data.spritesheet && data.sprites) {
		return dataHandler(defaultOptions, data);
	}
	return dataHandler.bind(null, Object.defineProperties(Object.create(null), {
		byDir: {
			value: Boolean(data.byDir)
		},
		isRem: {
			value: Boolean(data.isRem)
		},
		isOnlyRetina: {
			value: Boolean(data.isOnlyRetina)
		}
	}));
};