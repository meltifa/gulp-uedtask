## Gulp 中配置 ##

本库是 gulp.spritesmith 的 参数 `cssTemplate` 的配置工具。使用方法如下：

	var Library = require('haoycn-library');
	var sprite = require('gulp.spritesmith');
	var cssTemplate = new Library('sprite').use();

	gulp.task('sprite', function() {
		return gulp.src('./src/asset/sprite/*.png')
			.pipe(sprite({
				imgName: 'img/sprite.png',
				cssName: 'css/sprite.scss',
				retinaSrcFilter: './src/asset/sprite/*@2x.png',
				retinaImgName: 'img/sprite@2x.png',
				padding: 8,
				// 图片默认以名字中短横线 `-` 前的字符为分组名，如果没有短横线，则分组名为 `default`
				cssTemplate: cssTemplate
				// 支持以图片所在文件夹为分组名，需如下配置：
				// cssTemplate: cssTemplate({byDir: true})
			}))
			.pipe(gulp.dest('./src'));
	});

## SCSS 中使用雪碧图 ##

工具将自动生成一些变量。在使用中，请忽略变量的存在，不要直接使用，而是通过以下公开的函数来取值。

更具体的使用示例请参见 example 目录。

###sprite-prop($name, $prop, $retina: false)###

获取某个元素的信息。

 - $name: 图片名称
 - $prop: 属性名称，包括：
	 - `name`: 原图片名（无 `@2x` 和后缀）
	 - `width`: 宽（无单位）
	 - `height`: 高（无单位）
	 - `offset_x` 或 `x`: 在雪碧图中的水平偏移（无单位）
	 - `offset_x_pct` 或 `x_pct`: 在雪碧图中的水平偏移（单位：百分比）
	 - `offset_y` 或 `y`: 在雪碧图中的垂直偏移（无单位）
	 - `offset_y_pct` 或 `y_pct`: 在雪碧图中的垂直偏移（单位：百分比）
	 - `url` 或 `escaped_image`: 雪碧图地址
	 - `total_width`: 雪碧图总宽度（无单位）
	 - `total_height`: 雪碧图总高度（无单位）

 - $retina: 是否查询高清雪碧图


###sprite-group($group: 'default', $retina: false)###

获取一个分组。

 - $group: 分组名称
 - $retina: 是否查询高清雪碧图


###sprite-info($dir, $prop: null, $retina: false)###

查询雪碧图信息。

 - $dir: 如果项目里使用了多张雪碧图，此参数必需, 否则可以省略
 - $prop: 信息字段，可用的值有：
	 - `url` 或 `escaped_image`: 雪碧图地址
	 - `width` 或 `total_width` : 雪碧图总宽度（无单位）
	 - `height` 或 `total_height`: 雪碧图总高度（无单位）
 - $retina: 是否为查询高清雪碧图