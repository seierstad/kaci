var kaci = kaci || {};

(function(synth) {
    var getDroppableVoiceIndex,
        dropVoice,
        getKeyDownTime,
        getKeyUpTime,
        getSignal,
        voice,         // constructor for new voices
        startVoice,      // public method
        endVoice,
        maxVoiceCount = 1, // limit concurrent voices
        voices = [];   // the currently active voices
    
    voice = function(params) {
        var params = params || {},
            newObject = {},
            active = params.active || false,
            isActive,
            mute,
            keyDownTime = (new Date()).getTime(),
            keyUpTime = null,
            oscillator;
            
        newObject.frequency = params.frequency || 440;
        
        oscillator = synth.phaseDistortionOscillator({voice: newObject, patch: synth.patch.osc});
//        oscillator.setFrequency(frequency);
        
        isActive = function() {
            return active === true;
        };
        newObject.mute = function() {
            active = false;
            // kill oscillators...
        };
        newObject.getKeyDownTime = function() {
            return keyDownTime;
        };
        newObject.getKeyUpTime = function() {
            return keyUpTime;
        };
        newObject.getSignal = function(buffer) {
            return oscillator.getSignal(buffer);
        };
        newObject.end = function() {
            keyUpTime = (new Date()).getTime();
        };

        return newObject;        
    };
    
    getDroppableVoiceIndex = function() {
        // voices triggered by keys that have been released are dropped first
        // if there are no such voices, drop the voice triggered by the key first pressed
        
        var firstDown = Number.MAX_VALUE,
            firstUp = Number.MAX_VALUE,
            i,
            droppable;

        for (i = 0; i < voices.length; i += 1) {
            if (voices[i].keyUpTime && voices[i].keyUpTime < firstUp) {
                // the voice was triggered by a key that has been released
                firstUp = voices[i].keyUpTime;
                droppable = i;
            } else if (firstUp === Number.MAX_VALUE && voices[i].keyDownTime < firstDown) {
                // no released keys' voices found so far: comparing keyDown times
                firstDown = voices[i].keyDownTime;
                droppable = i;
            }
        }
    };
    
    dropVoice = function() {
        // drop the least important voice
        if (voices.length > 0) {
            var dropped = voices.splice(getDroppableVoiceIndex(),1);
            dropped[0].mute();
            delete(dropped[0]);
            if (voices.length === 0) {
                synth.lfo1.reset();
                synth.lfo2.reset();
            }
        }
    };
    
    startVoice = function(frequency) {
        var newVoice;
            
        while (voices.length >= maxVoiceCount) {
            dropVoice();
        }
        newVoice = voice({frequency: frequency});
        voices.push(newVoice);
        return newVoice;
    };
    synth.voices = voices; // todo: remove this after debugging
    synth.startVoice = startVoice;
    synth.dropVoice = dropVoice;
    return synth;
})(kaci);
