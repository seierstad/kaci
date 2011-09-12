var kaci = kaci || {};

(function(synth) {
    var patch,
        listeners,
        addListener,
        removeListener,
        selectWaveform,
        selectWrapper,
        setPatchParameter;
    patch = {
        osc: {
            wrapper: 'saw',
            waveform: 'sinus',
            resonanceFactor: 0.7,
            envelopeData: [[0,0],[0.5,1],[0.6,0],[1,1]]
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
        
        },
        env2: {
        
        }
    };
	selectOscWrapper = function(event) {
	    setPatchParameter(event, 'osc', 'wrapper');
        synth.drawWaveform(synth.pdo, 'waveform');
	};
	selectOscWaveform = function(event) {
	    setPatchParameter(event, 'osc', 'waveform');
	    synth.drawWaveform(synth.pdo, 'waveform');
	};
	selectLfoWaveform = function(event) {
	    setPatchParameter(event, 'lfo1', 'waveform');
	    synth.drawWaveform(synth.lfo1, 'lfo1-visualisation');
	};
	setPatchParameter = function(event, moduleName, paramName) {
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
	};
	synth.selectLfoWaveform = selectLfoWaveform;	
	synth.selectOscWaveform = selectOscWaveform;
	synth.selectOscWrapper = selectOscWrapper;
    synth.patch = patch;
    return synth;
})(kaci);

