var drawWaveform = function (waveGenerator, canvas, params) {
    if (!params) {
        params = {};
    }
    var context,
        phaseIncrement,
        coordinates,
        yValue,
        i,
        phase = 0,
        xOffset = params.xOffset || 0,
        yOffset = params.yOffset || 0,
        width,
        height,
        halfHeight;

    if (typeof canvas === 'string') {
        canvas = document.getElementById(canvas);
    }

    height = params.height || canvas.height || 100;
    width = params.width || canvas.width || 100;
    halfHeight = height / 2;

    context = canvas.getContext("2d");
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
            'x': i + xOffset,
            'y': yValue * (halfHeight) + halfHeight + yOffset
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
