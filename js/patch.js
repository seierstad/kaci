var kaci = kaci || {};

(function (synth) {
    var patch,
        listeners,
        addListener,
        removeListener,
        selectWaveform,
        selectWrapper,
        selectOscWaveform,
        selectOscWrapper,
        selectLfo1Waveform,
        selectLfo2Waveform,
        setPatchParameter,

        patchString,
        updateValue,
        subscribe,
        initPatch;

    if (localStorage) {
        patchString = localStorage.getItem('kaciPatch');
        if (patchString) {
            patch = JSON.parse(patchString);
        }
    }

    patch = {
        osc: {
            wrapper: 'saw',
            waveform: 'sinus',
            resonanceFactor: 1,
            envelopeData: [
                [0, 0],
                [0.4, 0.9],
                [1, 1]
            ]
        },
        lfo1: {
            waveform: 'saw',
            frequency: 3
        },
        lfo2: {
            waveform: 'sinus',
            frequency: 3
        },
        env1: {
            beforeSustain: {
                data: [
                    [0, 0],
                    [0.2, 1],
                    [0.3, 0.2],
                    [1, 0.5]
                ],
                duration: 300
            },
            sustain: {
                enabled: true
            },
            afterSustain: {
                data: [
                    [0, 0.5],
                    [1, 0]
                ],
                duration: 1000
            }
        },
        env2: {
            beforeSustain: {
                data: [
                    [0, 0],
                    [0.1, 1],
                    [0.7, 0.9],
                    [1, 0.5]
                ],
                duration: 300
            },
            sustain: {
                value: 0.5,
                enabled: true
            },
            afterSustain: {
                data: [
                    [0, 0.5],
                    [1, 0]
                ],
                duration: 1000
            }
        }
    };

    selectOscWrapper = function (event) {
        setPatchParameter(event, 'osc', 'wrapper');
        synth.drawWaveform(synth.pdo, 'waveform');
    };
    selectOscWaveform = function (event) {
        setPatchParameter(event, 'osc', 'waveform');
        synth.drawWaveform(synth.pdo, 'waveform');
    };
    selectLfo1Waveform = function (event) {
        setPatchParameter(event, 'lfo1', 'waveform');
        synth.drawWaveform(synth.lfo1, 'lfo1-visualisation');
    };
    selectLfo2Waveform = function (event) {
        setPatchParameter(event, 'lfo2', 'waveform');
        synth.drawWaveform(synth.lfo2, 'lfo2-visualisation');
    };

    setPatchParameter = function (event, moduleName, paramName) {
        var label, input, i;
        if (event.target.nodeName === 'CANVAS' || event.target.nodeName === 'LABEL') {
            label = event.target;
            while (label.nodeName !== 'LABEL') {
                label = label.parentNode;
            }
            for (i = 0; i < label.children.length; i += 1) {
                if (label.children[i].nodeName === 'INPUT') {
                    input = label.children[i];
                }
            }
        }
        if (event.target.nodeName === 'INPUT') {
            input = event.target;
        }
        if (input) {
            patch[moduleName][paramName] = input.value;
        }
        if (localStorage) {
            localStorage.setItem('kaciPatch', JSON.stringify(patch));
        }
    };
    updateValue = function (event, data) {
        console.log(event);
        console.log(data);
        var path = event.split('.');
        var controlledValue = patch;
        var i, j;
        for (var i = 2, j = path.length - 1; i < j; i += 1) {
            controlledValue = controlledValue[path[i]];
        }
        if (controlledValue[path[i]] !== data.value) {
            controlledValue[path[i]] = data.value;
            path[0] = 'model';
            path[1] = 'change';
            PubSub.publish(path.join('.'), {
                value: data.value
            });
        }
    };
    subscribe = function (obj, context) {
        var key,
            path = context || '';

        if (typeof obj === 'object') {
            for (key in obj) {
                if (obj.hasOwnProperty(key) && typeof obj[key] !== 'function') {
                    if (typeof obj[key] !== 'object') {
                        PubSub.subscribe(path + '.' + key, updateValue);
                    } else {
                        subscribe(obj[key], path + '.' + key);
                    }
                }
            }
        }
    };
    initPatch = function (obj, context) {
        var key,
            path = context || 'model.change';

        if (typeof obj === 'object') {
            for (key in obj) {
                if (obj.hasOwnProperty(key) && typeof obj[key] !== 'function') {
                    if (typeof obj[key] !== 'object') {
                        PubSub.publish(path + '.' + key, {
                            value: obj[key]
                        });
                    } else {
                        initPatch(obj[key], path + '.' + key);
                    }
                }
            }
        }
    };
    subscribe(patch, 'control.change');


    synth.selectLfo1Waveform = selectLfo1Waveform;
    synth.selectLfo2Waveform = selectLfo2Waveform;
    synth.selectOscWaveform = selectOscWaveform;
    synth.selectOscWrapper = selectOscWrapper;
    synth.initPatch = initPatch;
    synth.patch = patch;


    return synth;
})(kaci);
