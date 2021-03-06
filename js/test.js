var kaci = kaci || {};

// add oscillator
// (a superclass for phaseDistortionOscillator and lfo, providing base waveforms)
(function (synth) {
    var drawWaveform = function (waveGenerator, canvas, params) {
        var params = params || {},
            context,
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
            yValue = waveGenerator.getValueAtPhase(phase, params);
            coordinates = {'x': i + xOffset, 'y': yValue * (halfHeight) + halfHeight + yOffset};
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

    synth.drawWaveform = drawWaveform;
    synth.init = function () {
        var waveformName, 
            waveforms, 
            waveformSelector, 
            pdoElement, 
            pdoWaveforms, 
            button, 
            canvas, 
            radio, 
            lfoElement, 
            i;

        synth.pdEnv = synth.envelope(synth.patch.osc);
        synth.pdEnv.initView({
            parentId: 'pdo',
            callback:
                (function () {return function () {
                    synth.drawWaveform(synth.pdo, 'waveform');
                }})()
        });
        // init pdo
        synth.ribbon({
            height: '300px',
            width: '50px',
            parentId: 'pdo',
            dataObject: synth.patch.osc,
            controlledValue: 'resonanceFactor',
            changeEvent: 'control.change.pdo.resonance',
            updateEvent: 'model.change.pdo.resonance',
            minValue: 0.01,
            maxValue: 1,
            exponent: 2,
            callback:
                (function () {return function () {
                    synth.drawWaveform(synth.pdo, 'waveform');
                }})()
        });

        synth.lfo1 = synth.oscillator({patch: synth.patch.lfo1, eventBase: 'lfo1'});
        waveformSelector = synth.lfo1.addWaveformSelector({
            parentId: 'lfo', 
            elementId: 'lfo1-waveform-selector'
        });
        synth.drawWaveform(synth.lfo1, 'lfo1-visualisation');
        waveformSelector.addEventListener('click', synth.selectLfo1Waveform, false);
        synth.ribbon({
            height: '300px', 
            width: '50px', 
            parentId: 'lfo', 
            changeEvent: 'control.change.lfo1.frequency',
            updateEvent: 'model.change.lfo1.frequency',
            minValue: 0.01, 
            maxValue: 100, 
            exponent: 4, 
            className: 'ribbon'
        });


        synth.lfo2 = synth.oscillator({patch: synth.patch.lfo2, eventBase: 'lfo2'});
        waveformSelector = synth.lfo2.addWaveformSelector({
            parentId: 'lfo2', 
            elementId: 'lfo2-waveform-selector'
        });
        synth.drawWaveform(synth.lfo2, 'lfo2-visualisation');
        waveformSelector.addEventListener('click', synth.selectLfo2Waveform, false);
        synth.ribbon({
            height: '150px', 
            width: '50px', 
            parentId: 'lfo2', 
            changeEvent: 'control.change.lfo2.frequency',
            updateEvent: 'model.change.lfo2.frequency', 
            minValue: 0.1, 
            maxValue: 10, 
            exponent: 4, 
            className: 'ribbon'
        });

        synth.env1 = synth.keyEnvelope({patch: synth.patch.env1});
        synth.env1.initView({
            parentId: 'env1',
            width: '600px',
            height: '300px'
        });
        synth.env2 = synth.keyEnvelope({patch: synth.patch.env2});
        synth.env2.initView({
            parentId: 'env1',
            width: '600px',
            height: '300px'
        });
        synth.pdo = synth.phaseDistortionOscillator({patch: synth.patch.osc});
        synth.pdo.addGui();

        synth.audioOutput.setReadFunction(synth.getSignal);
        synth.keyboardController({
            parentId: 'keyboard', 
            baseFrequency: 55, 
            endKey: 37, 
            height: '190px', 
            width: '1000px', 
            className: 'keyboard'
        });
        synth.drawWaveform(synth.pdo, 'waveform');
        synth.audioOutput.enable();
    };

    return synth;
}(kaci));
document.addEventListener('DOMContentLoaded', kaci.init, false);

