if (!Object.keys) {
    alert('Your browser is not supported.');
}

var kaci = kaci || {};

// add oscillator
// (a superclass for phaseDistortionOscillator and lfo, providing base waveforms)
(function (synth) {
    var oscillator = function (params) {

        // private variables
        var params = params || {},
            phase = params.phase || 0,
            phaseStack = [],   // to enable saving/retrieving of phase (for multi voice setups)
            patch = params.patch || {},
            voice = params.voice || {},
            frequency = params.frequency || 0,
            waveforms,
            phaseIncrement,
            phi = Math.PI * 2,
            frequencyIndicatorTimer,

            bias = params.bias || 0,
            scale = params.scale || 1,

            // private functions
            updatePhaseIncrement,
            sampleAndHoldBuffer = {value: 0},
            addFrequencyIndicator,

            // public functions
            setFrequency,
            getFrequency,
            setWaveform,
            getWaveformNames,
            getWaveformName,
            getSignal,
            getValue,
            getValueAtPhase,
            next,
            fastForward,
            pushPhase,
            popPhase,
            getPhase,
            reset,
            addWaveformSelector;

        patch.waveform = patch.waveform || params.waveform || 'sinus';

        waveforms = {
            zero: function () {
                return 0;
            },
            sinus: function (phase) {
                return Math.sin(phase * phi);
            },
            square: function (phase) {
                if (phase > 0.5) {
                    return -1;
                } else {
                    return 1;
                }
            },
            additiveSquare: function (phase, maxHarmonic) {
                var value = 0, i = 1;
                maxHarmonic = maxHarmonic || 8;
                for (i = 1; i < maxHarmonic; i += 2) {
                    value += Math.sin(phase * phi * i) / i;
                }
                return value * (4 / Math.PI);
            },
            saw: function (phase) {
                return (phase - 0.5) * 2;
            },
            additiveSaw: function (phase, maxHarmonic) {
                var value = 0, i;
                maxHarmonic = maxHarmonic || 8;
                for (i = 1; i < maxHarmonic; i += 1) {
                    value += Math.sin(phase * phi * i) / i;
                }
                return value * (2 / Math.PI);
            },
            saw_inverse: function (phase) {
                return 1 - (phase * 2);
            },
            triangle: function (phase) {
                if (phase < 0.25) {
                    return phase * 4;
                } else if (phase < 0.75) {
                    return (phase - 0.5) * -4;
                } else {
                    return (phase - 1) * 4;
                }
            },
            additiveTriangle: function (phase, maxHarmonic) {
                var value = 0, i = 1, odd = true;
                maxHarmonic = maxHarmonic || 5;
                for (i = 1; i < maxHarmonic; i += 2) {
                    if (odd) {
                        value += Math.sin(phase * phi * i) / (i * i);
                    } else {
                        value -= Math.sin(phase * phi * i) / (i * i);
                    }
                    odd = !odd;
                }
                return value * (8 / Math.pow(Math.PI, 2));
            },
            sampleAndHold: function (phase, steps) {
                var fraction;
                steps = steps || 4;
                fraction = 1 / steps;
                if (phase % fraction < sampleAndHoldBuffer.phase % fraction) {
                    sampleAndHoldBuffer.value = Math.random();
                }
                sampleAndHoldBuffer.phase = phase;
                return (sampleAndHoldBuffer.value - 0.5) * 2;
            }
        };

        updatePhaseIncrement = function (freq) {
            phaseIncrement = freq / synth.sampleRate;
        };

        setFrequency = function (freq) {
            if (freq && typeof freq === 'number') {
                if (patch.frequency) {
                    patch.frequency = freq;
                } else if (voice.frequency) {
                    voice.frequency = freq;
                } else {
                    frequency = freq;
                }
            } else {
                freq = patch.frequency || voice.frequency || frequency;
            }
            updatePhaseIncrement(freq);
            return this;
        };

        getFrequency = function () {
            return patch.frequency || frequency;
        };

        setWaveform = function (waveName) {
            if (waveforms[waveName]) {
                patch.waveform = waveName;
            }
            return this;
        };

        getWaveformName = function () {
            return patch.waveform;
        };

        getWaveformNames = function () {
            return Object.keys(waveforms);
        };

        getSignal = function (buffer) {
            var i, size = buffer.length;
            for (i = 0; i < size; i += 1) {
                buffer[i] = next();
            }
            return buffer;
        };

        getValue = function () {
            return getValueAtPhase(phase);
        };

        getValueAtPhase = function (phase, functionParams) {
            var result;

            functionParams = functionParams || {};
            if (functionParams.waveform && waveforms[functionParams.waveform]) {
                result = waveforms[functionParams.waveform](phase);
            } else {
                result = waveforms[patch.waveform](phase);
            }
            return (result * scale) + bias;
        };
        fastForward = function (steps) {
            phase += phaseIncrement * steps;
            phase = phase % 1;
            return this;
        };
        next = function () {
            var value = getValueAtPhase(phase);
            phase += phaseIncrement;
            while (phase > 1) {
                phase -= 1;
            }
            return value;
        };
        pushPhase = function () {
            phaseStack.push(phase);
            return this;
        };
        popPhase = function () {
            if (phaseStack.length > 0) {
                phase = phaseStack.pop();
            }
            return this;
        };
        getPhase = function () {
            return phase;
        };
        reset = function () {
            phase = 0;
            return this;
        };
        addWaveformSelector = function (params) {
            var parentElement, names, waveformSelector, heading, button, canvas, radio, i;
            names = getWaveformNames();
            parentElement = document.getElementById(params.parentId);
            waveformSelector = document.createElement("fieldset");
            waveformSelector.setAttribute('id', params.elementId);
            heading = document.createElement("h2");
            heading.appendChild(document.createTextNode('waveform'));
            waveformSelector.appendChild(heading);
            for (i = 0; i < names.length; i += 1) {
                button = document.createElement("label");
                canvas = document.createElement("canvas");
                canvas.setAttribute('width', '50px');
                canvas.setAttribute('height', '50px');
                synth.drawWaveform(this, canvas, {waveform: names[i], noWrap: true, noPd: true});
                radio = document.createElement('input');
                radio.setAttribute('type', 'radio');
                radio.setAttribute('name', params.parentId + '-waveform');
                radio.setAttribute('value', names[i]);
                if (names[i] === patch.waveform) {
                    radio.setAttribute('checked', 'checked');
                }
                button.appendChild(radio);
                button.appendChild(document.createElement('br'));
                button.appendChild(canvas);

                waveformSelector.appendChild(button);
            }
            parentElement.appendChild(waveformSelector);
            return waveformSelector;
        };

        addFrequencyIndicator = function (params) {
            var params = params || {},
                wrapper,
                indicator,
                parent,
                activeClass = params.activeClass || 'active',
                toggleIndicator;

            wrapper = document.createElement("div");
            wrapper.setAttribute('class', 'frequency-indicator');
            indicator = document.createElement("div");
            parent = document.getElementById(params.parentId);

            indicator.setAttribute('class', activeClass);

            toggleIndicator = function () {
                if (indicator.getAttribute('class') === activeClass) {
                    indicator.removeAttribute('class');
                } else {
                    indicator.setAttribute('class', activeClass);
                }
            };

            wrapper.appendChild(indicator);
            parent.appendChild(wrapper);
            frequencyIndicatorTimer = setInterval(toggleIndicator, (500 / patch.frequency));

        };

        if (patch.frequency) {
            updatePhaseIncrement(patch.frequency);
        } else if (voice.frequency) {
            updatePhaseIncrement(voice.frequency);
        } else {
            updatePhaseIncrement(frequency);
        }

        return {
            setFrequency: setFrequency,
            getFrequency: getFrequency,
            setWaveform: setWaveform,
            getWaveformName: getWaveformName,
            getWaveformNames: getWaveformNames,
            getSignal: getSignal,
            getValue: getValue,
            getValueAtPhase: getValueAtPhase,
            pushPhase: pushPhase,
            popPhase: popPhase,
            getPhase: getPhase,
            reset: reset,
            next: next,
            fastForward: fastForward,
            addWaveformSelector: addWaveformSelector,
            addFrequencyIndicator: addFrequencyIndicator
        };
    };
    synth.oscillator = oscillator;
    return synth;
})(kaci);

(function (synth) {
    var phaseDistortionOscillator;

    phaseDistortionOscillator = function (params) {

            // private variables
        var params = params || {},
            oscillator = synth.oscillator(params),      // a base oscillator, used internally
            wrappers,        // available wrapper functions (for resonance)
            wrapper,
            patch = params.patch || {resonanceFactor: 1, waveform: 'sinus', wrapper: 'saw'},
            resonantPhase = 0,
            wrapperPhase = 0,
            phaseIncrement = 0,
            pdData,
            msIncrement = 1000 / synth.sampleRate,  // milliseconds between each sample
            voice = params.voice || {},
            frequency = params.frequency || 0,
            modulate,
            modulators = params.modulators || {
                resonance:
                    [
                        {
                            pre: synth.lfo1.pushPhase,
                            mod: synth.lfo1.next,
                            post: synth.lfo1.popPhase,
                            factor: 0.2,
                            bias: 0.1
                        },
                        {
                            mod: synth.env1.getValueAtTime,
                            factor: 0.7
                        }

                    ],
                pitch:
                    [
                        {
                            pre: synth.lfo2.pushPhase,
                            mod: synth.lfo2.next,
                            post: synth.lfo2.popPhase,
                            factor: 20,
                            bias: 0
                        },
                        {
                            mod: synth.env1.getValueAtTime,
                            factor: 0.01
                        }
                    ],
                amplitude:
                    [
                        {
                            mod: synth.env1.getValueAtTime
                        }
                    ],
                phase:  { mod: synth.pdEnv.getValueAtPhase }
            },

            // private functions
            getWrappedSignal,
            getWrappedValueAtPhase,
            getTimes,
            prepareModulators,
            resetModulators,
            updatePhaseIncrement,

            // public functions
            setFrequency,
            setWrapper,
            getWrapperName,
            getWrapperNames,
            getSignal,
            getValueAtPhase,
            setResonanceFactor,
            getResonanceFactor,
            setPhaseModulator,
            addGui;

        voice = params.voice || {};
        wrappers = {
            constant: function () {
                return 1;
            },
            saw: function (phase) {
                return 1 - phase;
            },
            halfSinus: function (phase) {
                return Math.sin(phase * Math.PI);
            }
        };
        prepareModulators = function () {
            var modulationTarget, i;
            for (modulationTarget in modulators) {
                if (modulators.hasOwnProperty(modulationTarget)) {
                    for (i = 0; i < modulators[modulationTarget].length; i += 1) {
                        if (modulators[modulationTarget][i].pre) {
                            modulators[modulationTarget][i].pre();
                        }
                    }
                }
            }
        };
        modulate = function (modulators, context) {
            var i, factor, bias, result = 1;
            for (i = 0; i < modulators.length; i += 1) {
                factor = modulators[i].factor || 1;
                bias = modulators[i].bias || 0;
                result = result * modulators[i].mod(context) * factor + bias;
            }
            return result;
        };
        resetModulators = function () {
            var modulationTarget, i;
            for (modulationTarget in modulators) {
                if (modulators.hasOwnProperty(modulationTarget)) {
                    for (i = 0; i < modulators[modulationTarget].length; i += 1) {
                        if (modulators[modulationTarget][i].post) {
                            modulators[modulationTarget][i].post();
                        }
                    }
                }
            }
        };
        getWrappedSignal = function (buffer) {
            var i,
                size = buffer.length,
                now = (new Date()).getTime(),
                times = getTimes(),
                context = {},
                oscValue;

            context.start = now - times.start;
            if (times.end) {
                context.end = now - times.end;
            }

            prepareModulators();

            for (i = 0; i < size; i += 1) {
                oscValue = oscillator.getValueAtPhase(modulators.phase.mod(resonantPhase)) * wrappers[patch.wrapper](wrapperPhase);
                buffer[i] = oscValue * modulate(modulators.amplitude, context);
                context.start += msIncrement;
                if (context.end) {
                    context.end += msIncrement;
                }
                wrapperPhase += phaseIncrement + (phaseIncrement * modulate(modulators.pitch, context));
                resonantPhase += phaseIncrement / (patch.resonanceFactor  + patch.resonanceFactor * modulate(modulators.resonance, context));
                while (wrapperPhase > 1) {
                    wrapperPhase -= 1;
                    resonantPhase = 0;
                }
                while (resonantPhase > 1) {
                    resonantPhase -= 1;
                }
            }
            resetModulators();
        };
        getSignal = function (buffer) {
            if (wrappers[patch.wrapper]) {
                return getWrappedSignal(buffer);
            }
            return oscillator.getSignal(buffer);
        };
        getWrappedValueAtPhase = function (phase, params) {
            var resonanceFactor = params.resonanceFactor || patch.resonanceFactor,
                resonantPhase = (phase / resonanceFactor) % 1,
                wrapValue;
            if (params.wrapper) {
                wrapValue = wrappers[params.wrapper](phase);
            } else {
                wrapValue = wrappers[patch.wrapper](phase);
            }
            if (!params.noPd) {
                return oscillator.getValueAtPhase(modulators.phase.mod(resonantPhase), params) * wrapValue;
            }
            return oscillator.getValueAtPhase(resonantPhase, params) * wrapValue;
        };
        getValueAtPhase = function (phase, params) {
            var params = params || {};
            if ((wrappers[patch.wrapper] || params.wrapper) && !params.noWrap) {
                return getWrappedValueAtPhase(phase, params);
            } else if (!params.noPd) {
                return oscillator.getValueAtPhase(modulators.phase.mod(phase), params);
            }
            return oscillator.getValueAtPhase(phase, params);
        };
        setFrequency = function (freq) {
            oscillator.setFrequency(freq);
            phaseIncrement = oscillator.getFrequency() / synth.sampleRate;
            return this;
        };
        setWrapper = function (wrapperName) {
            if (typeof wrappers[wrapperName] === 'function') {
                wrapper = wrappers[wrapperName];
            }
            return this;
        };
        getWrapperName = function () {
            var wrapperName;
            for (wrapperName in wrappers) {
                if (wrappers.hasOwnProperty(wrapperName) && wrapper === wrappers[wrapperName]) {
                    return wrapperName;
                }
            }
            throw {message: 'selected wrapper does not exist'};
        };
        getWrapperNames = function () {
            return Object.keys(wrappers);
        };
        setResonanceFactor = function (factor) {
            if (typeof factor === 'number' && factor > 0 && factor <= 1) {
                patch.resonanceFactor = factor;
            }
            return this;
        };
        getResonanceFactor = function () {
            return patch.resonanceFactor;
        };

        getTimes = function () {
            var start = voice.getKeyDownTime(), end = voice.getKeyUpTime();
            return {
                start: start,
                end: end
            };
        };
        setPdData = function (dataset) {
            pdData = dataset;
            return this;
        };
        addGui = function () {
            var waveformSelector, names, wrapperSelector, heading, button, canvas, radio, pdoElement, i;
            waveformSelector = oscillator.addWaveformSelector({parentId: 'pdo', elementId: 'pdo-waveform-selector'});
            waveformSelector.addEventListener('click', synth.selectOscWaveform, false);

            pdoElement = document.getElementById('pdo');
            names = getWrapperNames();
            wrapperSelector = document.createElement("fieldset");
            wrapperSelector.setAttribute('id', 'pdo-wrapper-selector');
            heading = document.createElement("h2");
            heading.appendChild(document.createTextNode('wrapper'));
            wrapperSelector.appendChild(heading);
            for (i = 0; i < names.length; i += 1) {
                button = document.createElement("label");
                canvas = document.createElement("canvas");
                canvas.setAttribute('width', '50px');
                canvas.setAttribute('height', '50px');
                synth.drawWaveform(this, canvas, {waveform: 'sinus', wrapper: names[i], resonanceFactor: 0.2, noPd: true});
                radio = document.createElement('input');
                radio.setAttribute('type', 'radio');
                radio.setAttribute('name', 'pdo-wrapper');
                radio.setAttribute('value', names[i]);
                if (names[i] === patch.wrapper) {
                    radio.setAttribute('checked', 'checked');
                }
                button.appendChild(radio);
                button.appendChild(document.createElement('br'));
                button.appendChild(canvas);

                wrapperSelector.appendChild(button);
            }
            pdoElement.appendChild(wrapperSelector);
            wrapperSelector.addEventListener('click', synth.selectOscWrapper, false);


        };

        updatePhaseIncrement = function (freq) {
            phaseIncrement = freq / synth.sampleRate;
        };

        if (patch.frequency) {
            updatePhaseIncrement(patch.frequency);
        } else if (voice.frequency) {
            updatePhaseIncrement(voice.frequency);
        } else {
            updatePhaseIncrement(frequency);
        }

        return {
            setFrequency: setFrequency,
            getFrequency: oscillator.getFrequency,
            setWaveform: oscillator.setWaveform,
            getWaveformName: oscillator.getWaveformName,
            getWaveformNames: oscillator.getWaveformNames,
            getSignal: getSignal,
            getValueAtPhase: getValueAtPhase,

            setPhaseModulator: setPhaseModulator,
            setWrapper: setWrapper,
            getWrapperName: getWrapperName,
            getWrapperNames: getWrapperNames,
            setResonanceFactor: setResonanceFactor,
            setPdData: setPdData,
            addGui: addGui
        };
    };

    synth.phaseDistortionOscillator = phaseDistortionOscillator;

    return synth;
})(kaci);

