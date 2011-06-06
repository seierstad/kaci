RibbonController.prototype = Controller;
RibbonController.prototype.constructor = RibbonController;

function RibbonController(parentId, controlledValue, params) {
	params.width = '50px';
	params.height = '300px';
   Controller.call(this, parentId, controlledValue, params);
	this.minValue = params.minValue;
	this.maxValue = params.maxValue;
	this.callback = params.callback;
	this.draggable = false;
	this.scrollable = false;
		
	var position = (this.data.value - this.minValue) / this.maxValue;
	this.valueIndicator = document.createElementNS(svgns, "circle");
	this.valueIndicator.setAttribute("cx", "50%");
	this.valueIndicator.setAttribute("cy", position * 100 + "%");
	this.valueIndicator.setAttribute("r", pointRadius);
	this.valueIndicator.setAttribute("fill", "#336699");
	this.controller.appendChild(this.valueIndicator);
	
	this.controller.addEventListener('mousedown', this.mouseDownHandler.bind(this), false);
	this.controller.addEventListener('mouseup', this.mouseUpHandler.bind(this), false);
	this.controller.addEventListener('mouseover', this.mouseOverHandler.bind(this), false);
	this.controller.addEventListener('mouseout', this.mouseOutHandler.bind(this), false);
	this.controller.addEventListener('mousemove', this.mouseMoveHandler.bind(this), false);
	document.addEventListener('DOMMouseScroll', this.scrollHandler.bind(this), false);
	document.addEventListener('mousewheel', this.scrollHandler.bind(this), false);
//	this.touchArea.addEventListener('touchstart', touchStartHandler, false);

};
RibbonController.prototype.cursorPosition = function(event) {
	var x, y;

	if (event.pageX != undefined && event.pageY != undefined) {
		x = event.pageX;
		y = event.pageY;
	} else {
		x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	x -= this.controller.parentNode.offsetLeft;
	y -= this.controller.parentNode.offsetTop;
	return {'x': x, 'y': y};
};

RibbonController.prototype.update = function() {
	var position = (this.data.value - this.minValue) / this.maxValue;
	this.valueIndicator.setAttribute("cy", position * 100 + "%");
};
RibbonController.prototype.sizeInPixels = function() {
	var unit = this.controller.height.baseVal.SVG_LENGTHTYPE_PX;
	this.controller.height.baseVal.convertToSpecifiedUnits(unit);
	this.controller.width.baseVal.convertToSpecifiedUnits(unit);
	var height = this.controller.height.baseVal.valueInSpecifiedUnits;
	var width = this.controller.width.baseVal.valueInSpecifiedUnits;
	return {'width': width, 'height': height};
};
RibbonController.prototype.changeHandler = function(event) {
	event.stopPropagation();
	event.preventDefault();
	var pixelCoordinates = this.cursorPosition(event);
	var svgSize = this.sizeInPixels();
	this.data.setValue(this.minValue + ((this.maxValue - this.minValue) * (pixelCoordinates.y / svgSize.height)));
	if(typeof this.callback === "function") {
		this.callback(this.data.value);
	}
};
	
RibbonController.prototype.mouseUpHandler = function(event) {
	this.draggable = false;
};
	
RibbonController.prototype.mouseDownHandler = function(event) {
	this.draggable = true;
	this.changeHandler(event);
};
RibbonController.prototype.mouseMoveHandler = function(event) {
	if (this.draggable === true) {
		this.changeHandler(event);
	}
};

RibbonController.prototype.scrollHandler = function(event) {
	if (this.scrollable) {
		event.stopPropagation();
		event.preventDefault();
		var increase = this.data.value * event.detail / 100;
		if ((this.data.value + increase) > this.minValue && (this.data.value + increase) <= this.maxValue ) {
			this.data.setValue(this.data.value += increase);
			if(typeof this.callback === "function") {
				this.callback(this.data.value);
			}
		}
	}
};
RibbonController.prototype.mouseOverHandler = function(event) {
	event.preventDefault();
	event.stopPropagation();
	this.scrollable = true;
};
	
RibbonController.prototype.mouseOutHandler = function(event) {
	event.preventDefault();
	event.stopPropagation();
	if (event.target.nodeName === 'svg' || event.target.nodeName === 'rect') {
		this.draggable = false;
		this.scrollable = false;
	}
};

var resonanceController = new RibbonController('container', resonantPhaseFactor, {'minValue': 0, 'maxValue': 1, 'callback': drawWaveform});
var frequencyController = new RibbonController('container', frequency, {'minValue': 0, 'maxValue': 1000});

