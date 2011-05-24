var Controller = function(parentId, controlledValue, params) {
	this.container = document.getElementById(parentId);
	this.controlled = controlledValue;
	this.minValue = params.minValue;
	this.maxValue = params.maxValue;
	this.callback = params.callback;

	var 
		controller,
		controllerTouchArea,
		initcontrollerAsSvg,
		valueIndicator;
		
	controller = document.createElementNS(svgns, "svg");
	controller.setAttribute("version", "1.2");
	controller.setAttribute("id", "resonance-controller");
	controller.setAttribute("width", "50px");
	controller.setAttribute("height", "300px");
	controller.setAttribute("baseProfile", "tiny");
	controllerTouchArea = document.createElementNS(svgns, "rect");
	controllerTouchArea.setAttribute("x", "0");
	controllerTouchArea.setAttribute("y", "0");
	controllerTouchArea.setAttribute("width", "100%");
	controllerTouchArea.setAttribute("height", "100%");
	controllerTouchArea.setAttribute("opacity", "0");
	controller.appendChild(controllerTouchArea);
	this.container.appendChild(controller);
	valueIndicator = document.createElementNS(svgns, "circle");
	valueIndicator.setAttribute("cx", "50%");
	var position = (this.controlled.value - this.minValue) / this.maxValue;
	valueIndicator.setAttribute("cy", position * 100 + "%");
	valueIndicator.setAttribute("r", pointRadius);
	valueIndicator.setAttribute("fill", "#336699");
	controller.appendChild(valueIndicator);

	var controllerChangeHandler = function(event) {
		event.stopPropagation();
		event.preventDefault();
		var pixelCoordinates = getCursorPositionSVG(event, event.currentTarget);
		var svgSize = getSVGSizeInPixels(getSvgRoot(event.currentTarget));
		this.controlled.value = this.minValue + ((this.maxValue - this.minValue) * (pixelCoordinates.y / svgSize.height));
		var position = (this.controlled.value - this.minValue) / this.maxValue;
		valueIndicator.setAttribute("cy", position * 100 + "%");
		this.callback(this.controlled.value);
		drawWaveform();
	}.bind(this);
	var valueIndicatorMouseUpHandler = function(event) {
		valueIndicator.removeEventListener('mousemove', controllerChangeHandler, false);
		valueIndicator.removeEventListener('mouseup', valueIndicatorMouseUpHandler, false);
	};
	var valueIndicatorMouseDownHandler = function(event) {
		valueIndicator.addEventListener('mousemove', controllerChangeHandler, false);
		valueIndicator.addEventListener('mouseup', valueIndicatorMouseUpHandler, false);
	};
	var controllerScrollHandler = function(event) {
		event.stopPropagation();
		event.preventDefault();
		var increase = this.controlled.value * event.detail / 100;
		if ((this.controlled.value + increase) > this.minValue && (this.controlled.value + increase) <= this.maxValue ) {
			this.controlled.value += increase;
			var position = (this.controlled.value - this.minValue) / this.maxValue;
			valueIndicator.setAttribute("cy", position * 100 + "%");
			this.callback(this.controlled.value);
			drawWaveform();
		}
	}.bind(this);
	var controllerMouseOverHandler = function(event) {
		document.addEventListener('DOMMouseScroll', controllerScrollHandler, false);
		document.addEventListener('mousewheel', controllerScrollHandler, false);
	};
	var controllerMouseOutHandler = function(event) {
		document.removeEventListener('DOMMouseScroll', controllerScrollHandler, false);
		document.removeEventListener('mousewheel', controllerScrollHandler, false);
	};


	valueIndicator.addEventListener('mousedown', valueIndicatorMouseDownHandler, false);
	controller.addEventListener('click', controllerChangeHandler, false);
	controller.addEventListener('mouseover', controllerMouseOverHandler, false);
	controller.addEventListener('mouseout', controllerMouseOutHandler, false);
	controllerTouchArea.addEventListener('touchstart', touchStartHandler, false);

};
function setFrequency(value) {
  phase_increment = value / sampleRate;
}

var resonanceController = new Controller('container', resonantPhaseFactor, {'minValue': 0, 'maxValue': 1, 'callback': drawWaveform});
var frequencyController = new Controller('container', frequency, {'minValue': 0, 'maxValue': 1000, 'callback': setFrequency});


