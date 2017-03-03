## 起步：安装 ##

全局安装：

	> npm install -g gulp gm

项目本地安装：

	> npm install --save-dev gulp gulp-uedtask

软件程序安装：http://www.graphicsmagick.org/

## 一、HTML ##

### （一）入口文件 ###

被编译的入口文件的匹配模式是：

	[
		'src/**/*.html',
		'!src/**/_*.html',
		'!src/{asset,template}/**/*.html'
	]

因此：

 - src/asset 和 src/template 目录内的 HTML 文件都不会作为入口文件
 - 任何以下划线 “_” 开头的 HTML 都不会作为入口文件
 - 其余任何 src 文件夹（含其子文件夹）内的 HTML 文件都会作为入口文件 

推荐的最佳实践：

 - 入口文件较少时，直接放置到 src 目录下
 - 当 HTML 过多时，将入口 HTML 文件存放到 src/html 文件夹中
 - 所有的模板文件放在 src/template 文件夹中

### （二）编译 ###

#### 1. 语法支持 ####

HTML 文件内支持 Juicer 语法。主要有：

 - 遍历：`{@each i in range(0, 5)}{@/each}`
 - 判断：`{@if i == 9}{@else}{@/if}`
 - 变量：`${escaped_var}`（转义为 HTML 实体） 和` $${unescaped_var}`（不转义）

例如：

	<!-- 转换前的代码 -->
	<ul>
		{@each i in range(2, 6)}
			<li{@if i == 2} class="first"{@/if}>${i}</li>
		{@/each}
	</ul>

	<!-- 转换后的代码 -->
	<ul>
		<li class="first">2</li>
		<li>3</li>
		<li>4</li>
		<li>5</li>
	</ul>


更多语法知识，可查看 Juicer 官方文档。


#### 2. 模板引擎 ####

通过 `template` 标签，可以实现模板的引入。


引入模板格式如：

	<template src="path/to/tpl.html" str="value" str2 bool="false" num="0.5">
		<fragment id="str3">
			value2
		</fragment>
	</template>

以上代码在编译时将被 path/to/tpl.html 内的内容（编译后）替换。

而在获取并编译这个模板时，传入了以下变量：

	/*注意变量类型转换*/
	{
		src: 'path/to/tpl.html',
		str: 'value',
		str2: 'str2',
		bool: false,
		num: 0.5,
		str3: 'value2'
	}

这些变量可以用于上述 Juicer 编译。

说明：

 - `src` 属性指向模板地址
 - 其他标签属性是传递给子模板的变量（推荐用来传入简短变量），模板可以深层引用，变量也会多层传递
 - `fragment` 是传递变量的另一种方式，`id` 是变量名，标签内的代码是变量值
 - 推荐用 `fragment` 来插入 HTML 字符串之类的长变量，而且如果是 HTML 代码，在变量内应当用 `$${}` 格式避免被编译
 - 全局变量有：`Number`、`String`、`Boolean`、`Math`、`Array`、`Object`。可以使用这些构造函数做一些辅助功能。

注意：在一个 HTML 文件内，`<template>` 和 `<segment>` 标签内部不可以再内嵌标签本身。如下做法是错误的：

	<!-- 以下是错误做法 -->
	<template src="header.html">
		<template src="top.html"></template>
	</template>

#### 3. 编译提示 ####

如果模板无法找到或模板语法错误，将在控制台给出提示（不会中断任务或报错），同时编译的 HTML 处将输出错误注释。

## 二、CSS ##

### （一）入口文件 ###

src/css 目录（含子目录）下所有不以下划线 “_” 开头的 SCSS 文件。

### （二）基本编译 ###

#### 1. 公共文件 ####

内置公用 Reset 和公用 SCSS 库。只需在 SCSS 文件中如下书写即可使用：

	@import 'reset';
	@import 'library';

#### 2. 兼容性处理 ####

内置 autoprefixer，故无需手动添加兼容性前缀。

#### 3. 资源版本号管理 ####

内置自动追加资源版本号。如下转换：

	// 转换前
	.a { background: url(../images/bg.png);/*会自动添加*/ }
	.b { background: url(../images/bg.png?v=2333);/*人工指定后将不会处理*/ }
	// 转换后
	.a { background: url(../images/bg.png?v=dfc3esdcd); }
	.b { background: url(../images/bg.png?v=2333); }

默认给所有资源添加版本号，但如果要跳过某些资源（比如每次开发都会被工具更改的字体文件）的处理，可以手动指定一个版本号。

如果没有手动指定版本号，且资源无法找到，将在控制台给出提示（不会中断任务或报错）。

### （三）应用：像素值自动除以2 ###

工具可将所有像素单位除以 2，这样只需按照设计稿量出的尺寸书写代码，而无需人工计算。

开启方法是在配置中如下添加：

	require('gulp-uedtask').run({
		// ... 其他配置
		divideBy2: true
	});

注意：

 - 如果像素值单位书写为大写（如：`120PX`），则该值不会被转换
 - 如果除法结果不为整数，将在控制台给出提示（不会中断任务或报错）
 - 要转换的像素值的最小绝对值为 `3`。因此，例如 `-2, -1, 0, 1, 2` 等数都不会被除以 2


### （四）应用：像素转REM单位 ###

REM 布局中，SCSS 中的像素值应当按照设计稿量出的尺寸书写，工具在配置后将自动将像素单位转换到 REM 单位。

注意：绝对值小于 `3`（不包含 `3`）的像素值以及像素值单位大写的值不会被转换到 REM 单位。

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

REM 布局需要 JavaScript 代码配合，该代码应当放置于 HTML 的 `<head>` 标签内。完整代码如下：

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


## 三、图片 ##

基本目录：src/images 或 src/img 文件夹。

会将基本目录下的 .png/.jpg/.gif 图片压缩后生成到 dist 对应目录。

如果以 .min.png/.min.jpg/.min.gif 为后缀，则只复制到 dist 对应目录，而不会压缩。

## 四、Sprites ##

### （一）入口文件 ###

#### 1. 单张与多张雪碧图 ####
基本目录：src/asset/sprite 文件夹。

如果生成单张雪碧图，则将元素切片直接放置于基本目录中。

如果生成多张，则按文件夹存储切片元素，并将这些文件夹置于基本目录下。

#### 2. 切片命名规范 ####

 - 元素切片名称中不应当包含短横线 `-`。如有需要，请用下划线 `_` 代替
 - 如果包含数字序列，如 “image1.png”、“image2.png”，序列数字应当用 `0` 补齐（如改名为：“image01.png”、“image02.png”），严格保持相同位数

### （二）SCSS语法 ###

工具将自动生成包含雪碧图信息的 SCSS 文件。需要用到雪碧图的时候，应当在所需 SCSS 中引入这些文件。

在多雪碧图项目中，一个 SCSS 文件内支持引入多个雪碧图数据文件。

在生成的雪碧图数据文件中，默认提供以下基本函数和混合：

#### 1. @function sprite-prop($name, $prop, $retina: null) ####

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

#### 2. @function sprite-group($group: 'default', $retina: null) ####

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

#### 3. @function sprite-info($group, $prop: null, $retina: null) ####

查询雪碧图信息。

 - $group: 分组名称。单张雪碧图可省略，多张雪碧图必须传入文件夹名
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

	// 多雪碧图模式
	@import '_sprite_home';
	.back {
		width: unquote(sprite-prop('home/back', 'width') + 'px');
	}

#### 4. @mixin sprite-item($name, $retina: null) ####

输出雪碧图切片元素的 `width`、`height`、`background-image`、`background-size`。

 - $name: 图片名称。如果是单张雪碧图，传入图片名称；如果是分文件夹，则传入 “文件夹名/图片名” 格式
 - $retina: 是否查询高清雪碧图，如果有高清图数据默认是，否则默认否

输出数据格式注意：

 - 存在高清数据时，才输出 `background-size`；
 - 使用 REM 布局时，输出的 `background-position` 采用百分比值。

#### 5. @mixin sprite-position($name, $retina: null) ####

输出雪碧图切片元素的 `background-position`。

 - $name: 图片名称。如果是单张雪碧图，传入图片名称；如果是分文件夹，则传入 “文件夹名/图片名” 格式
 - $retina: 是否查询高清雪碧图，如果有高清图数据默认是，否则默认否

输出数据格式注意：使用 REM 布局时，输出的 `background-position` 采用百分比值。

## 五、Iconfont ##

### （一）入口文件 ###

可将 SVG 图标生成为字体。

SVG 文件置于：src/asset/iconfont。

生成后的字体被放置于 dist/font 中。

### （二）页面编码要求 ###

Iconfont 使用 UTF-8 编码。应当在 UTF-8 页面内使用。

### （三）提交字体更新说明 ###

由于字体本身的特殊原因，每次执行任务后，即便没有更改 src 目录中的相关文件，字体文件都会变更。

解决方案：

 1. **只要没有更改 src 相关文件，生成的字体文件就无需提交。**因为 iconfont 一旦生成一次，就会指定一个固定的字符编码。这是通过重命名 src/iconfont 的 svg 文件实现的，所以请勿修改编码前缀。
 2. 给 SCSS 内引用的字体资源路径手动添加版本号，防止字体文件的无效变更造成 CSS 的更新。

下述的 Webfont 存在相同问题，解决策略同上。


### （四）SCSS 语法 ###

在生成的 _iconfont.scss 文件中，默认提供以下两个基本函数：

#### @function iconfont-item($name) ####

获取某一 iconfont 对应的字符编码。

如：

	// 编译前
	.a:before {
		content: iconfont-item('home');
	}
	
	// 编译后
	.a:before {
		content: "\ea01";
	}

#### @function iconfont-group() ####

用于在 `@each` 中遍历。

如：

	// 编译前
	@each $name, $char in iconfont-group() {

		.icon-#{$name}:before {
			content: $name;
		}
	}
	
	// 编译后
	.icon-home:before {
		content: "\ea01";
	}
	.icon-back:before {
		content: "\ea02";
	}

注：不在生成的 SCSS 文件中自动书写好 `@font-face` 等内容，是为了方便开发者自由书写，也是避免如果在某一项目的不同文件中多次引入 _iconfont.scss 导致多次写入 `@font-face` 等内容。

### （五）兼容IE6-7 ###

IE6-7 不支持伪元素。故需把实体编码放进 HTML 中。此操作可以自动完成。

配置：

	require('gulp-uedtask').run({
		// ... 其他配置项
		insertIconfont: true
	});

在 HTML 中书写格式：

	<i class="_i-more hello"></i>

以 `_i-[filename]` 格式作为插入标记。在生成的 HTML 中此类将被删除。

## 六、Webfont ##

### （一）入口文件 ###

在 src/asset/webfont 目录中放置两个相互对应的文件：字体本身和输入了所需文字的 HTML 文件。

要求：

 - 两个文件均以 CSS 中使用改字体的 `font-family` 值为文件名
 - HTML 内只能包含文字，不能包含 HTML 标签

精简后的字体文件被放置于 dist/font 目录中。

### （二）页面编码要求 ###

使用 Webfont 的页面应当为 UTF-8 编码。

## 七、运行Gulp ##

### （一）Gulpfile.js ###

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

### （二）命令行 ###

一般开发过程中，只需运行：

	> gulp dev

调用某个默认任务，使用（在 gulpfile.js 中该任务没有被禁止）：

	// xxxx可以是：html, css, sprite, image, js,  iconfont, webfont
	> gulp default:xxxx

完成开发，需要发布到 SVN 的时候，运行

	> gulp build