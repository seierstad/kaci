var
	xlinkns = 'http://www.w3.org/1999/xlink',
	svgns = 'http://www.w3.org/2000/svg',
	svgPoints = [],
	svgLines = [],
	pdTouchArea,
	initSvg,
	unitLookup;


var EnvelopeController = function(parentId, controlledValue) {
	var container = document.getElementById(parentId);
	this.envelope = document.createElementNS(svgns, "svg");
	
	this.controlledData = controlledValue;
	this.envelopePoints = [];
	this.envelopeLines = [];
	
	this.envelope.setAttribute("version", "1.2");
	this.envelope.setAttribute("id", "pd-plot");
	this.envelope.setAttribute("width", "500px");
	this.envelope.setAttribute("height", "300px");
	this.envelope.setAttribute("baseProfile", "tiny");
	var envelopeTouchArea = document.createElementNS(svgns, "rect");
	envelopeTouchArea.setAttribute("x", "0");
	envelopeTouchArea.setAttribute("y", "0");
	envelopeTouchArea.setAttribute("width", "100%");
	envelopeTouchArea.setAttribute("height", "100%");
	envelopeTouchArea.setAttribute("opacity", "0");
	this.envelope.appendChild(envelopeTouchArea);
	container.appendChild(this.envelope);
	
//	envelopeTouchArea.addEventListener('touchstart', touchStartHandler, false);
	this.envelope.addEventListener('click', this.clickHandler.bind(this), false);

	this.plot();
};
EnvelopeController.prototype.drawPoint = function(pointIndex, coordinates) {
	this.envelopePoints[pointIndex] = document.createElementNS(svgns, "circle");
	this.envelopePoints[pointIndex].setAttribute("cx", coordinates.x);
	this.envelopePoints[pointIndex].setAttribute("cy", coordinates.y);
	this.envelopePoints[pointIndex].setAttribute("r", pointRadius);
	this.envelopePoints[pointIndex].setAttribute("fill", "#336699");
	this.envelope.appendChild(this.envelopePoints[pointIndex]);
};
EnvelopeController.prototype.drawLine = function(lineIndex, startCoordinates, endCoordinates) {
		this.envelopeLines[lineIndex] = document.createElementNS(svgns, "line");
		this.envelopeLines[lineIndex].setAttribute("x1", startCoordinates.x);
		this.envelopeLines[lineIndex].setAttribute("y1", startCoordinates.y);
		this.envelopeLines[lineIndex].setAttribute("x2", endCoordinates.x);
		this.envelopeLines[lineIndex].setAttribute("y2", endCoordinates.y);
		this.envelopeLines[lineIndex].setAttribute("stroke-width", 2);
		this.envelopeLines[lineIndex].setAttribute("stroke", "#336699");
		this.envelope.appendChild(this.envelopeLines[lineIndex]);
};

EnvelopeController.prototype.getSvgCoordinates = function(point) {
	return {'x': (point[0] * 100) + '%', 'y': (100 - (point[1] * 100)) + '%'};
};

EnvelopeController.prototype.plot = function() {
	var i, coordinates = [];
	
	for (i = 0; i < this.controlledData.value.length; i++) {
		coordinates[i] = this.getSvgCoordinates(this.controlledData.value[i]);
	}
	for (i = 0; i < points.length; i++) {
		this.drawPoint(i, coordinates[i]);
	}
	for (i = 0; i < points.length-1; i++) {
		this.drawLine(i, coordinates[i], coordinates[i+1]);
	}
};

EnvelopeController.prototype.addPoint = function(x, y) {
	var newPointIndex = 0;

	while (newPointIndex < this.controlledData.value.length && this.controlledData.value[newPointIndex][0] <= x) {
		newPointIndex++;
	}
	
	this.controlledData.setValue(this.controlledData.value.splice(newPointIndex, 0, [x, y]));

	var coordinates = this.getSvgCoordinates(this.controlledData.value[newPointIndex]);
	var coordinatesNext = this.getSvgCoordinates(this.controlledData.value[newPointIndex + 1]);
	this.envelopePoints.splice(newPointIndex, 0, null);
	this.drawPoint(newPointIndex, coordinates);
	this.envelopeLines.splice(newPointIndex, 0, null);
	this.drawLine(newPointIndex, coordinates, coordinatesNext);
	redrawPointSVG(newPointIndex);
	drawWaveform();
};
function getCursorPosition(event, element) {
 var x, y;

 if (event.pageX != undefined && event.pageY != undefined) {
	x = event.pageX;
	y = event.pageY;
 } else {
	x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
 }

 x -= element.offsetLeft;
 y -= element.offsetTop;
 return {'x': x, 'y': y};
}
EnvelopeController.prototype.cursorPosition = function(event) {
    return getCursorPosition(event, this.envelope.parentNode);
};
EnvelopeController.prototype.sizeInPixels = function() {
	var unit = this.envelope.height.baseVal.SVG_LENGTHTYPE_PX;
	this.envelope.height.baseVal.convertToSpecifiedUnits(unit);
	this.envelope.width.baseVal.convertToSpecifiedUnits(unit);
	var height = this.envelope.height.baseVal.valueInSpecifiedUnits;
	var width = this.envelope.width.baseVal.valueInSpecifiedUnits;
	return {'width': width, 'height': height};
};
EnvelopeController.prototype.clickHandler = function(event) {
	event.stopPropagation();
	event.preventDefault();
	var pixelCoordinates = this.cursorPosition(event, event.currentTarget);
	var svgSize = this.sizeInPixels(event.currentTarget);
	this.addPoint(pixelCoordinates.x / svgSize.width, (svgSize.height - pixelCoordinates.y) / svgSize.height);
};

/*
function movePointSVG(pointIndex, coordinates) {
	svgPoints[pointIndex].setAttribute("cx", coordinates.x );
	svgPoints[pointIndex].setAttribute("cy", coordinates.y );
	if (pointIndex < svgPoints.length-1) {
		svgLines[pointIndex].setAttribute("x1", coordinates.x);
		svgLines[pointIndex].setAttribute("y1", coordinates.y);
	}
	if (pointIndex > 0) {
		svgLines[pointIndex-1].setAttribute("x2", coordinates.x);
		svgLines[pointIndex-1].setAttribute("y2", coordinates.y);
	}
}


var redrawPointSVG = function(pointIndex) {
	var coordinates = getSvgCoordinates(points[pointIndex]);
	
	svgPoints[pointIndex].setAttribute("cx", coordinates.x);
	svgPoints[pointIndex].setAttribute("cy", coordinates.y);
	if(pointIndex < svgLines.length) {
		svgLines[pointIndex].setAttribute("x1", coordinates.x);
		svgLines[pointIndex].setAttribute("y1", coordinates.y);
	}
	if (pointIndex > 0) {
		svgLines[pointIndex-1].setAttribute("x2", coordinates.x);
		svgLines[pointIndex-1].setAttribute("y2", coordinates.y);
	}
};

function getSvgRoot(svgElement) {
 	return (svgElement.nodeName == 'svg') ? svgElement : svgElement.ownerSVGElement;
}



function svgTouchHandler(event) {
	alert(event);
	var pixelCoordinates = getCursorPositionSVG(event.changedTouches[0], event.target);
	var svgSize = getSVGSizeInPixels(event.currentTarget);
	addPointSVG(pixelCoordinates.x / svgSize.width, (svgSize.height - pixelCoordinates.y) / svgSize.height);
}
function svgPointMoveHandler(event) {
	event.stopPropagation();
	event.preventDefault();
	var svgRoot = getSvgRoot(event.currentTarget);
	var pixelCoordinates = getCursorPositionSVG(event, svgRoot);
	var svgSize = getSVGSizeInPixels(svgRoot);
	var pointIndex;
	for (pointIndex = 0; pointIndex < svgPoints.length; pointIndex++) {
		if(svgPoints[pointIndex] === event.currentTarget) {
			break;
		}
	}
	points[pointIndex][0] = pixelCoordinates.x / svgSize.width;
	points[pointIndex][1] = (svgSize.height - pixelCoordinates.y) / svgSize.height;
	redrawPointSVG(pointIndex);
	drawWaveform();
}

function touchStartHandler(e) {
	var coordinates = getCursorPosition(e.changedTouches[0], e.target);
	handleEventAtCoordinates(coordinates, e.target);
	e.target.addEventListener("touchend", dummy, false);
	e.target.addEventListener("touchmove", dummy, false);
	e.target.addEventListener("touchout", dummy, false);
}

function pointFocus(event) {
	event.stopPropagation();
	event.preventDefault();
	event.currentTarget.addEventListener("mousemove", svgPointMoveHandler, false);
//	event.currentTarget.addEventListener("touchmove", touchMovePoint, false);
	event.target.setAttribute("r", 19);
}
function pointUnfocus(event) {
	event.stopPropagation();
	event.preventDefault();
	event.currentTarget.removeEventListener("mousemove", svgPointMoveHandler, false);
//	event.currentTarget.removeEventListener("touchmove", touchMovePoint, false);
	event.target.setAttribute("r", pointRadius);
}
*/
var pdData = new ControlledValue([[0,0], [1,1]]);
var pdEnvelope = new EnvelopeController('container', pdData);

