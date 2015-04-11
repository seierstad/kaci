/* global document */
var drawWaveform = require('./drawWaveform');

var WaveformSelector = function (oscillator, waveforms, eventName, eventDispatchObject, controlName, initialValue) {
    var parentElement = null,
        names,
        waveformSelector,
        waveformSelectorElement,
        heading,
        button,
        canvas,
        radio,
        i;

    names = Object.keys(waveforms);

    waveformSelectorElement = document.createElement("fieldset");
    waveformSelectorElement.setAttribute('class', 'waveform-selector');


    heading = document.createElement("legend");
    heading.appendChild(document.createTextNode('waveform'));
    waveformSelectorElement.appendChild(heading);

    var drawer = function (phase) {
        return waveforms[names[i]].call(oscillator, phase);
    };

    for (i = 0; i < names.length; i += 1) {
        button = document.createElement("label");
        canvas = document.createElement("canvas");
        canvas.setAttribute('width', '50px');
        canvas.setAttribute('height', '50px');
        drawWaveform(drawer, canvas);
        radio = document.createElement('input');
        radio.setAttribute('type', 'radio');
        radio.setAttribute('name', controlName + '-selector');
        radio.setAttribute('value', names[i]);
        if (names[i] === initialValue) {
            radio.setAttribute('checked', 'checked');
        }
        button.appendChild(radio);
        button.appendChild(document.createElement('br'));
        button.appendChild(canvas);

        waveformSelectorElement.appendChild(button);
    }

    waveformSelectorElement.addEventListener('change', function (evt) {
        var event = new CustomEvent(eventName, {
            detail: evt.target.value
        });
        eventDispatchObject.dispatchEvent(event);
    });

    return waveformSelectorElement;
};

module.exports = WaveformSelector;