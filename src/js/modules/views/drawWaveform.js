const drawWaveform = function (waveGenerator, canvas, params) {
    "use strict";

    let canvasElement,
        context,
        coordinates,
        halfHeight,
        height,
        i,
        phase = 0,
        phaseIncrement,
        width,
        xOffset = params.xOffset || 0,
        yOffset = params.yOffset || 0,
        yValue;

    if (typeof canvas === "string") {
        canvasElement = document.getElementById(canvas);
    }

    height = params.height || canvasElement.height || 100;
    width = params.width || canvasElement.width || 100;
    halfHeight = height / 2;

    context = canvasElement.getContext("2d");
    context.lineJoin = "miter";

    if (!params.noClear) {
        context.clearRect(xOffset, yOffset, width, height);
    }
    if (params.drawGuides) {
        context.beginPath();
        context.moveTo(xOffset, halfHeight + yOffset);
        context.lineTo(xOffset + width, halfHeight + yOffset);
        context.stroke();
    }

    context.beginPath();

    phaseIncrement = 1.0 / width;
    for (i = 0; i < width; i += 1) {
        yValue = waveGenerator(phase);
        coordinates = {
            "x": i + xOffset,
            "y": yValue * (halfHeight) + halfHeight + yOffset
        };
        if (i === 0) {
            context.moveTo(coordinates.x, coordinates.y);
        } else {
            context.lineTo(coordinates.x, coordinates.y);
        }
        phase += phaseIncrement;
    }
    context.stroke();
    return this;
};

module.exports = drawWaveform;
