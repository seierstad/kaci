const drawWaveform = function (waveGenerator, canvas, params) {
    "use strict";

    let canvasElement,
        phase = 0,
        xOffset = params && params.xOffset || 0,
        yOffset = params && params.yOffset || 0;

    if (typeof canvas === "string") {
        canvasElement = document.getElementById(canvas);
    } else {
        canvasElement = canvas;
    }

    const height = params && params.height || canvasElement.height || 100;
    const width = params && params.width || canvasElement.width || 100;
    const halfHeight = height / 2;

    const context = canvasElement.getContext("2d");
    context.lineJoin = "miter";

    context.clearRect(xOffset, yOffset, width, height);

    if (params && params.drawGuides) {
        context.beginPath();
        context.moveTo(xOffset, halfHeight + yOffset);
        context.lineTo(xOffset + width, halfHeight + yOffset);
        context.stroke();
    }

    context.beginPath();

    const phaseIncrement = 1.0 / width;
    for (let i = 0; i < width; i += 1) {
        const yValue = waveGenerator(phase);
        const coordinates = {
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


export default drawWaveform;
