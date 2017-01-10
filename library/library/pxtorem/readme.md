本模块用于生成需要转换到REM值的属性名。默认以下属性均要转换：

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
		'border-spacing','box-shadow','line-height'

可以根据项目对上述列表进行修改，如：

	// 禁止转换 line-height
	// 添加转换 font-size
	pxtorem('!line-height', 'font-size')