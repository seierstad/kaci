var
	container = document.getElementById("container"),
	xlinkns = 'http://www.w3.org/1999/xlink',
	svgns = 'http://www.w3.org/2000/svg',
	svgPoints = [],
	svgLines = [],
	mySvg = document.createElementNS(svgns, "svg"),
	pdTouchArea,
	initSvg,
	unitLookup;

initSvg = function() {	
	mySvg.setAttribute("version", "1.2");
	mySvg.setAttribute("id", "pd-plot");
	mySvg.setAttribute("width", "450px");
	mySvg.setAttribute("height", "300px");
	mySvg.setAttribute("baseProfile", "tiny");
	pdTouchArea = document.createElementNS(svgns, "rect");
	pdTouchArea.setAttribute("x", "0");
	pdTouchArea.setAttribute("y", "0");
	pdTouchArea.setAttribute("width", "100%");
	pdTouchArea.setAttribute("height", "100%");
	pdTouchArea.setAttribute("opacity", "0");
	mySvg.appendChild(pdTouchArea);
	container.appendChild(mySvg);
};
initSvg();
unitLookup = function(unitNumber) {
	switch (unitNumber) {
		case 0:
		case 1:
			return '';
		case 2:
			return '%';
		case 3:
			return 'em';
		case 4:
			return 'ex';
		case 5:
			return 'px';
		case 6:
			return 'cm';
		case 7:
			return 'mm';
		case 8:
			return 'in';
		case 9:
			return 'pt';
		case 10:
			return 'pc';
	}
}
function getPointCoordinatesFromSize(point, width, height) {
	var x, y;
	
	x = point[0] * width;
	y = height - point[1] * height;
	
	return {'x': x, 'y': y};
}
function getSvgCoordinates(point, svgElement) {
	var width, height, widthUnit, heightUnit, unitless;
	
	width = svgElement.width.baseVal.valueInSpecifiedUnits;
	height = svgElement.height.baseVal.valueInSpecifiedUnits;

	widthUnit = unitLookup(svgElement.width.baseVal.unitType);
	heightUnit = unitLookup(svgElement.height.baseVal.unitType);
	unitless = getPointCoordinatesFromSize(point, width, height);
	
	return {'x': unitless.x, 'y': unitless.y, 'xUnit': widthUnit, 'yUnit': heightUnit};
}
function movePointSVG(pointIndex, coordinates) {
	svgPoints[pointIndex].setAttribute("cx", coordinates.x + '' + coordinates.xUnit);
	svgPoints[pointIndex].setAttribute("cy", coordinates.y + '' + coordinates.yUnit);
	if (pointIndex < svgPoints.length-1) {
		svgLines[pointIndex].setAttribute("x1", coordinates.x + '' + coordinates.xUnit);
		svgLines[pointIndex].setAttribute("y1", coordinates.y + '' + coordinates.yUnit);
	}
	if (pointIndex > 0) {
		svgLines[pointIndex-1].setAttribute("x2", coordinates.x + '' + coordinates.xUnit);
		svgLines[pointIndex-1].setAttribute("y2", coordinates.y + '' + coordinates.yUnit);
	}
}
touchMovePoint = function(event) {

};

function drawPoint(pointIndex, coordinates, svgElement) {
	svgPoints[pointIndex] = document.createElementNS(svgns, "circle");
	svgPoints[pointIndex].setAttribute("cx", coordinates.x + '' + coordinates.xUnit);
	svgPoints[pointIndex].setAttribute("cy", coordinates.y + '' + coordinates.yUnit);
	svgPoints[pointIndex].setAttribute("r", pointRadius);
	svgPoints[pointIndex].setAttribute("fill", "#336699");
	svgPoints[pointIndex].addEventListener('mousedown', pointFocus, false);
	svgPoints[pointIndex].addEventListener('mouseup', pointUnfocus, false);
	svgPoints[pointIndex].addEventListener('touchstart', pointFocus, false);
	svgPoints[pointIndex].addEventListener('touchend', pointUnfocus, false);
	svgPoints[pointIndex].addEventListener("touchmove", touchMovePoint, false);
	svgElement.appendChild(svgPoints[pointIndex]);

}
function drawLine(lineIndex, startCoordinates, endCoordinates, svgElement) {
		svgLines[lineIndex] = document.createElementNS(svgns, "line");
		svgLines[lineIndex].setAttribute("x1", startCoordinates.x + '' + startCoordinates.xUnit);
		svgLines[lineIndex].setAttribute("y1", startCoordinates.y + '' + startCoordinates.yUnit);
		svgLines[lineIndex].setAttribute("x2", endCoordinates.x + '' + endCoordinates.xUnit);
		svgLines[lineIndex].setAttribute("y2", endCoordinates.y + '' + endCoordinates.yUnit);
		svgLines[lineIndex].setAttribute("stroke-width", 2);
		svgLines[lineIndex].setAttribute("stroke", "#336699");
		svgElement.appendChild(svgLines[lineIndex]);
}

function drawPointsSVG(points, svgElement) {
	var i, coordinates = [];
	
	for (i = 0; i < points.length; i++) {
		coordinates[i] = getSvgCoordinates(points[i], svgElement);
	}
	for (i = 0; i < points.length; i++) {
		drawPoint(i, coordinates[i], svgElement);
	}
	for (i = 0; i < points.length-1; i++) {
		drawLine(i, coordinates[i], coordinates[i+1], svgElement);
	}
}

var addPointSVG = function(x, y) {
	var newPointIndex = 0;

	while (newPointIndex < points.length && points[newPointIndex][0] <= x) {
		newPointIndex++;
	}
	points.splice(newPointIndex, 0, [x, y]);

	var coordinates = getSvgCoordinates(points[newPointIndex], mySvg);
	var coordinatesNext = getSvgCoordinates(points[newPointIndex + 1], mySvg);
	svgPoints.splice(newPointIndex, 0, null);
	drawPoint(newPointIndex, coordinates, mySvg);
	svgLines.splice(newPointIndex, 0, null);
	drawLine(newPointIndex, coordinates, coordinatesNext, mySvg);
	redrawPointSVG(newPointIndex);
	drawWaveform();
};

var redrawPointSVG = function(pointIndex) {
	var coordinates = getSvgCoordinates(points[pointIndex], mySvg);
	
	svgPoints[pointIndex].setAttribute("cx", coordinates.x + '' + coordinates.xUnit);
	svgPoints[pointIndex].setAttribute("cy", coordinates.y + '' + coordinates.yUnit);
	if(pointIndex < svgLines.length) {
		svgLines[pointIndex].setAttribute("x1", coordinates.x + '' + coordinates.xUnit);
		svgLines[pointIndex].setAttribute("y1", coordinates.y + '' + coordinates.yUnit);
	}
	if (pointIndex > 0) {
		svgLines[pointIndex-1].setAttribute("x2", coordinates.x + '' + coordinates.xUnit);
		svgLines[pointIndex-1].setAttribute("y2", coordinates.y + '' + coordinates.yUnit);
	}
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
function getSvgRoot(svgElement) {
 	return (svgElement.nodeName == 'svg') ? svgElement : svgElement.ownerSVGElement;
}

getCursorPositionSVG = function(event, svgElement) {
	 var svgRoot = getSvgRoot(svgElement);
    return getCursorPosition(event, svgRoot.parentNode);
};

getSVGSizeInPixels = function(svgElement) {
	var unit = svgElement.height.baseVal.SVG_LENGTHTYPE_PX;
	svgElement.height.baseVal.convertToSpecifiedUnits(unit);
	svgElement.width.baseVal.convertToSpecifiedUnits(unit);
	var height = svgElement.height.baseVal.valueInSpecifiedUnits;
	var width = svgElement.width.baseVal.valueInSpecifiedUnits;
	return {'width': width, 'height': height};
};

drawPointsSVG(points, mySvg);

function svgClickHandler(event) {
	event.stopPropagation();
	event.preventDefault();
	var pixelCoordinates = getCursorPositionSVG(event, event.currentTarget);
	var svgSize = getSVGSizeInPixels(event.currentTarget);
	addPointSVG(pixelCoordinates.x / svgSize.width, (svgSize.height - pixelCoordinates.y) / svgSize.height);
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
dummy = function(event) {
	alert(event.type);
};

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
pdTouchArea.addEventListener('touchstart', touchStartHandler, false);
mySvg.addEventListener('click', svgClickHandler, false);
//mySvg.addEventListener('touchstart', svgClickHandler, false);

