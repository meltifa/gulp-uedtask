module.exports = function() {
	var list = Array.from(arguments);
	var black = [];
	var white = [
		'top', 'right', 'bottom', 'left', 'clip', 'clip-path',
		'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
		'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
		'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
		'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
		'border-radius', 'border-top-right-radius', 'border-top-left-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
		'border-image', 'border-image-width', 'border-image-outset',
		'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
		'background', 'background-position', 'background-size',
		'outline', 'outline-width', 'outline-offset',
		'columns', 'column-width', 'column-rule', 'column-rule-width',
		'flex', 'flex-basis',
		'transform', 'transform-origin', 'perspective', 'perspective-origin',
		'border-spacing','box-shadow','line-height', 'font-size'
	];

	list.reduce(function(args, prop) {
		if(0 === prop.indexOf('!')) {
			args.black.push(prop.substring(1));
		} else if(args.white.indexOf(prop) < 0) {
			args.white.push(prop);
		}
		return args;
	}, {
		white: white,
		black: black
	});

	return white.filter(function(prop) {
		return this.indexOf(prop) < 0;
	}, black);
};