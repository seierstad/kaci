

var 
	resonanceController,
	resonanceControllerTouchArea,
	initResonanceControllerAsSvg,
	resonanceIndicator;

initResonanceControllerAsSvg = function() {
	resonanceController = document.createElementNS(svgns, "svg");
	resonanceController.setAttribute("version", "1.2");
	resonanceController.setAttribute("id", "resonance-controller");
	resonanceController.setAttribute("width", "50px");
	resonanceController.setAttribute("height", "300px");
	resonanceController.setAttribute("baseProfile", "tiny");
	resonanceControllerTouchArea = document.createElementNS(svgns, "rect");
	resonanceControllerTouchArea.setAttribute("x", "0");
	resonanceControllerTouchArea.setAttribute("y", "0");
	resonanceControllerTouchArea.setAttribute("width", "100%");
	resonanceControllerTouchArea.setAttribute("height", "100%");
	resonanceControllerTouchArea.setAttribute("opacity", "0");
	resonanceController.appendChild(resonanceControllerTouchArea);
	container.appendChild(resonanceController);
	resonanceIndicator = document.createElementNS(svgns, "circle");
	resonanceIndicator.setAttribute("cx", "50%");
	resonanceIndicator.setAttribute("cy", resonantPhaseFactor * 100 + "%");
	resonanceIndicator.setAttribute("r", pointRadius);
	resonanceIndicator.setAttribute("fill", "#336699");
	resonanceController.appendChild(resonanceIndicator);
};

var resonanceControllerChangeHandler = function(event) {
	event.stopPropagation();
	event.preventDefault();
	var pixelCoordinates = getCursorPositionSVG(event, event.currentTarget);
	var svgSize = getSVGSizeInPixels(getSvgRoot(event.currentTarget));
	resonantPhaseFactor = pixelCoordinates.y / svgSize.height;
	resonanceIndicator.setAttribute("cy", resonantPhaseFactor * 100 + "%");
	drawWaveform();
};
var resonanceIndicatorMouseUpHandler = function(event) {
	resonanceIndicator.removeEventListener('mousemove', resonanceControllerChangeHandler, false);
	resonanceIndicator.removeEventListener('mouseup', resonanceIndicatorMouseUpHandler, false);
};
var resonanceIndicatorMouseDownHandler = function(event) {
	resonanceIndicator.addEventListener('mousemove', resonanceControllerChangeHandler, false);
	resonanceIndicator.addEventListener('mouseup', resonanceIndicatorMouseUpHandler, false);
};
var resonanceControllerScrollHandler = function(event) {
	event.stopPropagation();
	event.preventDefault();
	var increase = resonantPhaseFactor * event.detail / 100;
	if ((resonantPhaseFactor + increase) > 0.0001 && (resonantPhaseFactor + increase) <= 1.0 ) {
		resonantPhaseFactor += increase;
		resonanceIndicator.setAttribute("cy", resonantPhaseFactor * 100 + "%");
		drawWaveform();
	}
};
var resonanceControllerMouseOverHandler = function(event) {
	document.addEventListener('DOMMouseScroll', resonanceControllerScrollHandler, false);
	document.addEventListener('mousewheel', resonanceControllerScrollHandler, false);
};
var resonanceControllerMouseOutHandler = function(event) {
	document.removeEventListener('DOMMouseScroll', resonanceControllerScrollHandler, false);
	document.removeEventListener('mousewheel', resonanceControllerScrollHandler, false);
};

initResonanceControllerAsSvg();
resonanceIndicator.addEventListener('mousedown', resonanceIndicatorMouseDownHandler, false);
resonanceController.addEventListener('click', resonanceControllerChangeHandler, false);
resonanceController.addEventListener('mouseover', resonanceControllerMouseOverHandler, false);
resonanceController.addEventListener('mouseout', resonanceControllerMouseOutHandler, false);
resonanceControllerTouchArea.addEventListener('touchstart', touchStartHandler, false);


