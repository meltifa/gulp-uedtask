## HTML ##

### 目录 ###

被编译的入口文件的匹配模式是：

	[
		'src/**/*.html',
		'!src/**/_*.html',
		'!src/{asset,template}/**/*.html'
	]

因此：

 1. src/asset 和 src/template 目录内的 HTML 文件都不会作为入口文件
 2. 任何以下划线 “_” 开头的 HTML 都不会作为入口文件
 3. 其余任何 src 文件夹（含其子文件夹）内的 HTML 文件都会作为入口文件 

推荐的最佳实践：

 1. 入口文件较少时，直接放置到 src 目录下
 2. 当 HTML 过多时，将入口 HTML 文件存放到 src/html 文件夹中
 2. 所有的模板文件放在 src/template 文件夹中

### 编译 ###

HTML 文件内支持 Juicer 语法。主要有：

 1. 遍历：`{@each i in range(0, 5)}{@/each}`
 2. 判断：`{@if i == 9}{@else}{@/if}`
 3. 变量：`${escaped_var}` 和` $${unescaped_var}`

引入模板格式如：

	<template src="path/to/tpl.html" name="value">
		<fragment id="name2">
			value2
		</fragment>
	</template>

说明：

 1. `src` 属性指向模板地址
 2. 其他标签属性是传递给子模板的变量（推荐用来传入简短变量），模板可以多层嵌套，变量也会多层传递
 3. `fragment` 是传递变量的另一种方式，`id` 是变量名，标签内的代码是变量值（推荐用来插入 HTML 字符串之类的长变量）
 4. 全局变量有：`Number`、`String`、`Boolean`、`Math`、`Array`、`Object`。可以使用这些构造函数做一些辅助功能。如：

		{@if Math.random() > 0.5}
			随机显示
		{@/if}

如果模板无法找到或模板语法错误，将在控制台给出提示（不会中断任务或报错），同时编译的 HTML 处将输出错误注释。

## CSS ##

### 入口文件 ###

src/css 目录（含子目录）下所有不以下划线 “_” 开头的 SCSS 文件。

### 基础功能 ###

内置 autoprefixer，故无需手动添加兼容性前缀。

内置公用 Reset 和公用 SCSS 库。只需在 SCSS 文件中如下书写即可使用：

	@import 'reset';
	@import 'library';

内置自动追加资源版本号。如果引用资源无法找到，将在控制台给出提示（不会中断任务或报错）。

### 移动端百分比布局 ###

以百分比自适应布局的移动端页面，可以使用 `divideBy2` 来将所有像素单位除以 2，这样只需按照设计稿量出的尺寸书写代码，而无需手（心）动计算。开启方法是在配置中如下添加：

	{
		divideBy2: 'warn=true&min=3'
	}


 1. `warn` 为 `true` 时，如果除法结果不为整数，将在控制台给出提示（不会中断任务或报错）
 2. `min` 为要转换的像素值的最小绝对值。如设置为 `3` 时，`-2, -1, 0, 1, 2` 等数都不会被除以 2
 3. 如果像素值单位书写为大写（如：`120PX`），则该值不会被转换

### 移动端REM布局 ###

REM 布局中，SCSS 中的像素值应当按照设计稿量出的尺寸书写。但是：绝对值小于3（不包含3）的像素值以及像素值单位大写的值不会被转换到 REM 单位。

以下是转换属性白名单，即仅下述值会被转换到 REM：


	[
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
	]

注意：REM 布局需要 JavaScript 代码配合，该代码应当放置于 HTML 的 `<head>` 标签内。完整代码如下：

	(function() {
		var html = document.documentElement;
		var setSize = function() {
			var width = html.offsetWidth;
			return html.style.fontSize = width / 18.75 + 'px';
		};
		var timer;
		var delayLayout = function() {
			clearTimeout(timer);
			return timer = setTimeout(setSize, 150);
		};
		window.addEventListener('pageshow', function(evt) {
			return evt.persisted && delayLayout();
		});
		window.addEventListener('resize', delayLayout);
		return setSize();
	}());

## Sprites ##

### 生成雪碧图 ###

基本目录：src/asset/sprite 文件夹。

如果生成单张雪碧图，则将元素切片直接放置于基本目录中。而如果生成多张，则按文件夹存储切片元素，并将这些文件夹置于基本目录下。

### 切片命名规范 ###

 1. 元素切片名称中不应当包含短横线“-”。如有需要，请用下划线“_”代替
 2. 如果包含数字序列，如 “image1.png”、“image2.png”，序列数字应当保持相同位数，建议用“0”补齐（如改名为：“image01.png”、“image02.png”）

### SCSS语法 ###

将自动生成包含雪碧图的 SCSS 文件。需要用到雪碧图的时候，应当在所需 SCSS 中引入雪碧图数据的 SCSS 文件。

支持引入多个雪碧图文件。

在生成的 _sprite.scss 文件中，默认提供以下三个基本函数：

####@function sprite-prop($name, $prop, $retina: null)####

获取某个元素的信息。

 - $name: 图片名称。如果是单张雪碧图，传入图片名称；如果是分文件夹，则传入 “文件夹名/图片名” 格式
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
 - $retina: 是否查询高清雪碧图，如果有高清图数据默认是，否则默认否

例如：

	// 单雪碧图模式
	@import '_sprite';
	.spr {
		$url: sprite-info('url');
		background: url($url);
	}


	// 多雪碧图模式
	@import '_sprite_cart';
	@import '_sprite_cate';
	.cart {
		$url: sprite-info('cart', 'url');
		background: url($url);
	}
	.cate {
		$url: sprite-info('cate', 'url');
		background: url($url);
	}

####@function sprite-group($group: 'default', $retina: null)####

获取一个分组（方便用 @each 遍历）。

 - $group: 分组名称。单张雪碧图可省略，多张雪碧图必须传入文件夹名
 - $retina: 是否查询高清雪碧图，如果有高清图数据默认是，否则默认否

例如：

	// 单雪碧图模式
	@import '_sprite';
	@each $name, $sprite in sprite-group() {
		.icon-#{$name} {
			width: unquote(sprite-prop($sprite, 'width') + 'px');
		}
	}

	// 多雪碧图模式略

####@function sprite-info($dir, $prop: null, $retina: null)####

查询雪碧图信息。

 - $dir: 如果项目里使用了多张雪碧图，此参数必需, 否则可以省略
 - $prop: 信息字段，可用的值有：
	 - `url` 或 `escaped_image`: 雪碧图地址
	 - `width` 或 `total_width` : 雪碧图总宽度（无单位）
	 - `height` 或 `total_height`: 雪碧图总高度（无单位）
 - $retina: 是否查询高清雪碧图，如果有高清图数据默认是，否则默认否

例如：

	// 单雪碧图模式
	@import '_sprite';
	.back {
		width: unquote(sprite-prop('back', 'width') + 'px');
	}

	// 多雪碧图模式略
	@import '_sprite_home';
	.back {
		width: unquote(sprite-prop('home/back', 'width') + 'px');
	}


## Iconfont ##

此功能用于将 SVG 图标生成为字体。

SVG 文件置于：src/asset/iconfont。源文件将被自动添加前缀，请忽略（原因见下述）。

生成后的字体被放置于 dist/font 中。

### 提交字体更新说明 ###

由于字体本身的特殊原因，每次执行任务后，即便没有更改 src 目录中的相关文件，字体文件都会变更。

不过，**只要没有更改 src 相关文件，生成的字体文件就无需提交。**因为 iconfont 一旦生成一次，就会指定一个固定的字符编码。这是通过重命名 src/iconfont 的 svg 文件实现的，所以请勿修改编码前缀，只管删除文件和添加文件即可。

下述的 Webfont 存在相同问题，解决策略也是一样——无需提交更新（因为文字的编码是固定的）。


### SCSS 语法 ###

在生成的 _iconfont.scss 文件中，默认提供以下两个基本函数：

#### @function iconfont-prop($name) ####

获取某一 iconfont 对应的字符编码。

如：

	// in SCSS
	.a:before {
		content: iconfont-prop('home');
	}
	
	// in CSS
	.a:before {
		content: "\ea01";
	}

#### @function iconfont-group() ####

用于在 `@each` 中遍历。

如：

	// in SCSS
	@each $name, $char in iconfont-group() {

		.icon-#{$name}:before {
			content: $name;
		}
	}

	// in CSS
	.icon-home:before {
		content: "\ea01";
	}
	.icon-back:before {
		content: "\ea02";
	}

注：不在 SCSS 文件中自动书写好 @font-face 等内容，是为了方便开发者自由书写，也是避免如果在某一项目的不同文件中多次引入 _iconfont.scss 导致多次写入 @font-face 等内容。

### 兼容IE6-7 ###

IE6-7 不支持伪元素。故需把实体编码放进 HTML 中。此操作可以自动完成。

配置：

	{
		insertIconfont: true
	}

在 HTML 中书写格式：

	<i class="_i-more hello"></i>

以 “_i-[filename]” 格式作为插入标记。在生成的 HTML 中此类将被删除。

## Webfont ##

此功能用于将特殊字体简化，只抽取个别所需文字。

### 入口文件 ###

在 src/asset/webfont 目录中放置两个相互对应的文件：字体本身和输入了所需文字的 HTML 文件。

要求：

 1. 两个文件均以 CSS 中使用改字体的 `font-family` 值为文件名
 2. HTML 内只能包含文字，不能包含 HTML 标签

精简后的字体文件被放置于 dist/font 目录中。


## 运行Gulp ##

### Gulpfile.js ###

如下：

	'use strict';
	const task = require('gulp-uedtask');
	// 如果需要定义其他Gulp相关（如添加自定义任务，通过这样的方法获取 gulp）
	const gulp = task.gulp;

	// 通过 ban() 方法禁用某个默认任务
	task.ban(['webfont']);
	// 或者通过 only() 方法只开启某个任务（方便在老项目中使用此工具的部分功能）
	// task.only(['webfont']);

	// 最后通过 run([options][, callback]) 方法结束
	// 支持链式调用：task.ban(['webfont']).run()
	task.run({
		// 配置项
		// ...
		useRetina: true
	});

### 命令行 ###

一般开发过程中，只需运行：

	> gulp

调用某个默认任务，使用（在 gulpfile.js 中该任务没有被禁止）：

	// xxxx可以是：html, css, sprite, image, js,  iconfont, webfont
	> gulp default:xxxx

完成开发，需要发布到 SVN 的时候，运行

	> gulp build