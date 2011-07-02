var 
	drawWaveformSelector,
	drawWaveform,
	drawWaveformParameterized;
	
drawWaveformSelector = function () {
	var waveformName, offset = 0;
	for (waveformName in baseWaveforms) {
      drawWaveformParameterized(baseWaveforms[waveformName], waveformCanvas, offset, 0, 50, 50);
      offset += 50;
    }
};
drawWaveform = function () {
	drawWaveformParameterized(baseWaveform, waveformCanvas, 0, 50, waveformCanvas.width, waveformCanvas.height - 50);
};

drawWaveformParameterized = function (waveFunction, canvas, xOffset, yOffset, width, height) {
	var context, localPhase, localResonantPhase, localPhaseIncrement, yValue, i, coordinates;

	context = canvas.getContext("2d");
	context.clearRect(xOffset, yOffset, width, height);
	context.lineJoin = "miter";
    context.beginPath();
    context.moveTo(xOffset, (height / 2) + yOffset);
    context.lineTo(xOffset + width, (height / 2) + yOffset);
    context.stroke();
    context.beginPath();

    localPhase = 0;
	localResonantPhase = 0;
    localPhaseIncrement = 1.0 / width; 
    for (i = 0; i < width; i += 1) {
        yValue = waveFunction(phaseDistort(localResonantPhase)) * wrapperFunction(localPhase);
        coordinates = {'x': i + xOffset, 'y': yValue * (height / -2) + (height / 2) + yOffset};
        if (i === 0) {
            context.moveTo(coordinates.x, coordinates.y);
        } else {
            context.lineTo(coordinates.x, coordinates.y);
        }
        localPhase += localPhaseIncrement;
        localResonantPhase += localPhaseIncrement / resonantPhaseFactor.value;
    }
    context.stroke();
};

drawWaveform();
// drawWaveformSelector();
