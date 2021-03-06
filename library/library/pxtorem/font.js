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