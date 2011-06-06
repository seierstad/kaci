var
	xlinkns = 'http://www.w3.org/1999/xlink',
	svgns = 'http://www.w3.org/2000/svg',
	svgPoints = [],
	svgLines = [],
	pdTouchArea,
	initSvg,
	unitLookup;

var EnvelopeController = function(parentId, controlledValue) {
	this.container = document.getElementById(parentId);
	this.controller = document.createElementNS(svgns, "svg");
	
	this.data = controlledValue;
	this.points = [];
	this.lines = [];
	this.selectedPoint = null;
	
	this.controller.setAttribute("version", "1.2");
	this.controller.setAttribute("id", "envelope");
	this.controller.setAttribute("width", "500px");
	this.controller.setAttribute("height", "300px");
	this.controller.setAttribute("baseProfile", "tiny");
	this.touchArea = document.createElementNS(svgns, "rect");
	this.touchArea.setAttribute("x", "2%");
	this.touchArea.setAttribute("y", "2%");
	this.touchArea.setAttribute("width", "96%");
	this.touchArea.setAttribute("height", "96%");
	this.touchArea.setAttribute("opacity", "0");
	this.controller.appendChild(this.touchArea);
	this.container.appendChild(this.controller);
	
//	touchArea.addEventListener('touchstart', touchStartHandler, false);
	this.controller.addEventListener('click', this.clickHandler.bind(this), false);
	this.controller.addEventListener('mousedown', this.mouseDownHandler.bind(this), false);
	this.controller.addEventListener('mouseup', this.mouseUpHandler.bind(this), false);
//	this.controller.addEventListener('mouseout', this.mouseOutHandler.bind(this), false);
	this.controller.addEventListener('mousemove', this.mouseMoveHandler.bind(this), false);
	
	this.plot();
};
EnvelopeController.prototype.drawPoint = function(pointIndex, coordinates) {
	this.points[pointIndex] = document.createElementNS(svgns, "circle");
	this.points[pointIndex].setAttribute("cx", coordinates.x);
	this.points[pointIndex].setAttribute("cy", coordinates.y);
	this.points[pointIndex].setAttribute("r", pointRadius);
	this.points[pointIndex].setAttribute("fill", "#336699");
	this.controller.appendChild(this.points[pointIndex]);
};
EnvelopeController.prototype.drawLine = function(lineIndex, startCoordinates, endCoordinates) {
		this.lines[lineIndex] = document.createElementNS(svgns, "line");
		this.lines[lineIndex].setAttribute("x1", startCoordinates.x);
		this.lines[lineIndex].setAttribute("y1", startCoordinates.y);
		this.lines[lineIndex].setAttribute("x2", endCoordinates.x);
		this.lines[lineIndex].setAttribute("y2", endCoordinates.y);
		this.lines[lineIndex].setAttribute("stroke-width", 2);
		this.lines[lineIndex].setAttribute("stroke", "#336699");
		this.controller.appendChild(this.lines[lineIndex]);
};

EnvelopeController.prototype.getSvgCoordinates = function(point) {
	return {'x': (point[0] * 100) + '%', 'y': (100 - (point[1] * 100)) + '%'};
};

EnvelopeController.prototype.plot = function() {
	var i, coordinates = [];
	
	for (i = 0; i < this.data.value.length; i++) {
		coordinates[i] = this.getSvgCoordinates(this.data.value[i]);
	}
	for (i = 0; i < points.length-1; i++) {
		this.drawLine(i, coordinates[i], coordinates[i+1]);
	}
	for (i = 0; i < points.length; i++) {
		this.drawPoint(i, coordinates[i]);
	}
};

EnvelopeController.prototype.redrawPoint = function(pointIndex) {
	var coordinates = this.getSvgCoordinates(this.data.value[pointIndex]);
	
	this.points[pointIndex].setAttribute("cx", coordinates.x);
	this.points[pointIndex].setAttribute("cy", coordinates.y);
	if(pointIndex < this.lines.length) {
		this.lines[pointIndex].setAttribute("x1", coordinates.x);
		this.lines[pointIndex].setAttribute("y1", coordinates.y);
	}
	if (pointIndex > 0) {
		this.lines[pointIndex-1].setAttribute("x2", coordinates.x);
		this.lines[pointIndex-1].setAttribute("y2", coordinates.y);
	}
};

EnvelopeController.prototype.addPoint = function(x, y) {
	var newPointIndex = 0;

	while (newPointIndex < this.data.value.length && this.data.value[newPointIndex][0] <= x) {
		newPointIndex++;
	}
	var newData = this.data.value.slice(0);
	newData.splice(newPointIndex, 0, [x, y]);
	this.data.setValue(newData);

	var coordinates = this.getSvgCoordinates(this.data.value[newPointIndex]);
	var coordinatesNext = this.getSvgCoordinates(this.data.value[newPointIndex + 1]);
	this.points.splice(newPointIndex, 0, null);
	this.drawPoint(newPointIndex, coordinates);
	this.lines.splice(newPointIndex, 0, null);
	this.drawLine(newPointIndex, coordinates, coordinatesNext);
	this.redrawPoint(newPointIndex);
	return newPointIndex;
};
EnvelopeController.prototype.deletePoint = function(point) {
	var pointIndex;
	for (pointIndex = 0; pointIndex < this.points.length; pointIndex++) {
		if(this.points[pointIndex] === point) {
			break;
		}
	}
	
	this.data.value.splice(pointIndex, 1);
	
	var deleteLine = this.lines[pointIndex];
	var deletePoint = this.points[pointIndex];

	this.points.splice(pointIndex, 1);
	this.lines.splice(pointIndex, 1);

	deleteLine.parentNode.removeChild(deleteLine);
	deletePoint.parentNode.removeChild(deletePoint);

	this.redrawPoint(pointIndex);
	drawWaveform();
};

EnvelopeController.prototype.cursorPosition = function(event) {
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
EnvelopeController.prototype.sizeInPixels = function() {
	var unit = this.controller.height.baseVal.SVG_LENGTHTYPE_PX;
	this.controller.height.baseVal.convertToSpecifiedUnits(unit);
	this.controller.width.baseVal.convertToSpecifiedUnits(unit);
	var height = this.controller.height.baseVal.valueInSpecifiedUnits;
	var width = this.controller.width.baseVal.valueInSpecifiedUnits;
	return {'width': width, 'height': height};
};
EnvelopeController.prototype.clickHandler = function(event) {
	event.stopPropagation();
	event.preventDefault();

};
EnvelopeController.prototype.mouseDownHandler = function(event) {
	event.stopPropagation();
	event.preventDefault();
	if (event.target.nodeName === 'circle') {
		this.pointFocus(event);
		this.selectedPoint = event.target;
	} else if (event.target.nodeName === 'rect' || event.target.nodeName === 'line') {
		var pixelCoordinates = this.cursorPosition(event);
		var svgSize = this.sizeInPixels();
		var selectedPointIndex = this.addPoint(pixelCoordinates.x / svgSize.width, (svgSize.height - pixelCoordinates.y) / svgSize.height);
		this.selectedPoint = this.points[selectedPointIndex];
		
	}
};
EnvelopeController.prototype.mouseUpHandler = function(event) {
	event.stopPropagation();
	event.preventDefault();
	if (this.selectedPoint !== null) {
		this.pointUnfocus(this.selectedPoint);
		this.selectedPoint = null;
	}
};
EnvelopeController.prototype.mouseOutHandler = function(event) {
	event.stopPropagation();
	event.preventDefault();
	if (this.selectedPoint !== null && event.target === this.touchArea) {
		this.pointUnfocus(this.selectedPoint);
		this.deletePoint(this.selectedPoint);
		this.selectedPoint = null;
	}
};

EnvelopeController.prototype.mouseMoveHandler = function(event) {
	event.stopPropagation();
	event.preventDefault();
	if (this.selectedPoint !== null) {
		this.movePoint(this.selectedPoint, event);
	}
};

EnvelopeController.prototype.movePoint = function(point, event) {
	var pixelCoordinates = this.cursorPosition(event);
	var svgSize = this.sizeInPixels();
	var pointIndex;
	for (pointIndex = 0; pointIndex < this.points.length; pointIndex++) {
		if(this.points[pointIndex] === point) {
			break;
		}
	}
	
	this.data.value[pointIndex][0] = pixelCoordinates.x / svgSize.width;
	this.data.value[pointIndex][1] = (svgSize.height - pixelCoordinates.y) / svgSize.height;
	this.redrawPoint(pointIndex);
	drawWaveform();
};
EnvelopeController.prototype.pointFocus = function(event) {
	event.target.setAttribute("r", 19);
};
EnvelopeController.prototype.pointUnfocus = function(element) {
	element.setAttribute("r", pointRadius);
};

/*


function svgTouchHandler(event) {
	alert(event);
	var pixelCoordinates = getCursorPositionSVG(event.changedTouches[0], event.target);
	var svgSize = getSVGSizeInPixels(event.currentTarget);
	addPointSVG(pixelCoordinates.x / svgSize.width, (svgSize.height - pixelCoordinates.y) / svgSize.height);
}


function touchStartHandler(e) {
	var coordinates = getCursorPosition(e.changedTouches[0], e.target);
	handleEventAtCoordinates(coordinates, e.target);
	e.target.addEventListener("touchend", dummy, false);
	e.target.addEventListener("touchmove", dummy, false);
	e.target.addEventListener("touchout", dummy, false);
}

*/
pdData.afterUpdate = drawWaveform;
var pdEnvelope = new EnvelopeController('container', pdData);

