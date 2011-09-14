var kaci = kaci || {};

// add synth constants
(function(synth){
    synth.sampleRate = 44100;

/*
    // first implementation of voices...
    synth.oscillators = [];
    
    var mixer = function(buffer) {
        var signals = [], i, j, size = buffer.length;
        for (i = 0; i < synth.oscillators.length; i += 1) {
            signals[i] = new Float32Array(size);
            synth.oscillators[i].getSignal(signals[i]);
        }
        for (j = 0; j < size; j += 1) {
            for (i = 0; i < signals.length; i += 1) {
                buffer[j] += signals[i][j] / signals.length;
            }
        }
    };
    synth.mix = mixer;
*/    
    var getSignal = function(buffer) {
        var signals = [], 
            size = buffer.length, 
            i, j;
        if (synth.voices.length > 0) {
            if (synth.voices.length === 1) {
                synth.voices[0].getSignal(buffer);
            } else {
                // get the voices
                for (i = 0; i < synth.voices.length; i += 1) {
                    signals[i] = new Float32Array(size);
                    synth.voices[i].getSignal(signals[i]);
                }
                // ... and mix
                for (j = 0; j < size; j += 1) {
                    for (i = 0; i < synth.voices.length; i += 1) {
                        buffer[j] += signals[i][j];
                    }
                    buffer[j] = buffer[j] / signals.length;
                }
            }
            synth.lfo1.fastForward(size);
            synth.lfo2.fastForward(size);
        }

        return buffer;
    };    
    
    synth.getSignal = getSignal;
    
    return synth;
})(kaci);


