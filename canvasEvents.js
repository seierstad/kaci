
/*
      var pdPlotCanvas = document.getElementById("phase-distortion-plot");
      var pdPlot = pdPlotCanvas.getContext("2d");
      pdPlot.lineWidth = lineWidth;
*/

function getPointClickedIndex(coordinates) {
	for (var i = 0; i < points.length; i++) {
		var xDiff, yDiff, pointCoordinates;
		pointCoordinates = getPointCoordinates(points[i], pdPlotCanvas);
		xDiff = pointCoordinates.x - coordinates.x;
		yDiff = pointCoordinates.y - coordinates.y;
		if(Math.abs(xDiff) < pointSelectTolerance && Math.abs(yDiff) < pointSelectTolerance ) {
			return i;
		}
	}
	return null;
}

function getPointValues(coordinates, canvasElement) {
	var width, height, x, y;
	
	width = canvasElement.width;
	height = canvasElement.height;
	x = coordinates.x / width;
	y = (height - coordinates.y) / height;
	
	return [x, y];
}

function getPointCoordinates(point, element) {
	var width, height;
	
	width = element.width;
	height = element.height;
	return getPointCoordinatesFromSize(point, width, height);
}

function removeMouseListeners(element) {
	element.removeEventListener("mousemove", mouseMovePoint, false);
	element.removeEventListener("mouseup", releasePoint, false);
	element.removeEventListener("mouseout", deletePoint, false);
}

function handleEventAtCoordinates(coordinates, canvas) {
  	var pointIndex = getPointClickedIndex(coordinates);
	if (!!!pointIndex) {
		pointIndex = addPoint(coordinates, canvas);
	}
	if (!!pointIndex) {
		selectedPointIndex = pointIndex;
	}
	return pointIndex;
}

function getAffectedPoints(pointIndex) {
	var i;
	if(pointIndex == 0) {
		return [points[pointIndex], points[pointIndex+1]];
	}
	if(pointIndex == points.length-1) {
		return [points[pointIndex-1], points[pointIndex]];
	}
	return [points[pointIndex-1], points[pointIndex], points[pointIndex+1]];
}


function removeClickEventHandling(element) {
	element.removeEventListener("mousedown", canvasClicked, false);
}

function addClickEventHandling(element) {
	element.addEventListener("mousedown", canvasClicked, false);
}

function touchMovePoint(e) {
	e.preventDefault();
	removeClickEventHandling(e.target);
	var coordinates = getCursorPosition(e.changedTouches[0], e.target);
	movePoint(coordinates, e.target);
	addClickEventHandling(e.target);
}

function mouseMovePoint(e) {
	var coordinates = getCursorPosition(e, e.target);
	movePoint(coordinates, e.target);
}

function movePoint(coordinates, canvas) {
	clearSelectedPoint();
	clearRedrawArea(getAffectedPoints(selectedPointIndex));
	points[selectedPointIndex][0] = coordinates.x / canvas.width;
	points[selectedPointIndex][1] = (canvas.height - coordinates.y) / canvas.height;
	drawPoints(getAffectedPoints(selectedPointIndex), canvas);
	drawWaveform();
}

function deletePoint(e) {
	points.splice(selectedPointIndex, 1);
	selectedPointIndex = null;
	removeMouseListeners(e.target);
	removeTouchListeners(e.target);
	clearRedrawArea(points);
	drawPoints(points, e.target);
	drawWaveform();
}

function addPoint(coordinates, canvas) {
	var point = getPointValues(coordinates, canvas);
	var newPointIndex = 0;
	while (newPointIndex < points.length && points[newPointIndex][0] <= point[0]) {
		newPointIndex++;
	}
	points.splice(newPointIndex, 0, point);
	clearRedrawArea(points);
	drawPoints(points, canvas);
	drawWaveform();
	return newPointIndex;
}

function releasePoint(event) {
	selectedPointIndex = null;
	removeMouseListeners(event.target);
	removeTouchListeners(event.target);
}

function removeTouchListeners(element) {
	element.removeEventListener("touchmove", touchMovePoint, false);
	element.removeEventListener("touchend", releasePoint, false);
	element.removeEventListener("touchout", deletePoint, false);
}

function clearSelectedPoint() {
	var coordinates = getPointCoordinates(points[selectedPointIndex], pdPlotCanvas);
	var radius = pointRadius + lineWidth;
	pdPlot.clearRect(coordinates.x - radius, coordinates.y - radius, radius * 2, radius * 2);
}

function clearRedrawArea(affectedPoints) {
	var i, height, width,
		xMax = affectedPoints[0][0], 
		xMin = affectedPoints[0][0], 
		yMax = affectedPoints[0][1],
		yMin = affectedPoints[0][1];
		
	for(i = 0; i < affectedPoints.length; i++) {
		if (affectedPoints[i][0] > xMax) { xMax = affectedPoints[i][0] }
		if (affectedPoints[i][0] < xMin) { xMin = affectedPoints[i][0] }
		if (affectedPoints[i][1] > yMax) { yMax = affectedPoints[i][1] }
		if (affectedPoints[i][1] < yMin) { yMin = affectedPoints[i][1] }
	}
	var maxCoordinates = getPointCoordinates([xMax, yMax], pdPlotCanvas);
	var minCoordinates = getPointCoordinates([xMin, yMin], pdPlotCanvas);
	height = maxCoordinates.y - minCoordinates.y;
	width = maxCoordinates.x - minCoordinates.x;
	pdPlot.clearRect(minCoordinates.x , minCoordinates.y, width, height);
}

function drawPoints(points, canvasElement) {
	var i, pointCoordinates = [];
	var canvasContext = canvasElement.getContext("2d");
	for (i = 0; i < points.length; i++) {
		pointCoordinates[i] = getPointCoordinates(points[i], canvasElement);
		if (i == 0) {
   		canvasContext.moveTo(pointCoordinates[i].x, pointCoordinates[i].y);	
		} else {
			canvasContext.lineTo(pointCoordinates[i].x, pointCoordinates[i].y);	
		}
	}
	canvasContext.stroke();
	canvasContext.closePath();
	for (i = 0; i < points.length; i++) {
		canvasContext.beginPath();
		canvasContext.arc(pointCoordinates[i].x, pointCoordinates[i].y, pointRadius, 0, Math.PI * 2, false);
  		canvasContext.stroke();
  		canvasContext.fill();
		canvasContext.closePath();
	}
}

drawPoints(points, pdPlotCanvas);

