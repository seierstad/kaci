var kaci = kaci || {};

(function (synth) {
    var getDroppableVoiceIndex,
        dropVoice,
        getKeyDownTime = null,
        getKeyUpTime = null,
        getSignal,
        voice,         // constructor for new voices
        startVoice,      // public method
        endVoice,
        maxVoiceCount = 6, // limit concurrent voices
        voices = [],   // the currently active voices
        voiceId = 0;

    voice = function (params) {
        var params = params || {},
            newObject = {},
            active = params.active || false,
            isActive,
            mute,
            keyDownTime = (new Date()).getTime(),
            keyUpTime = null,
            oscillator;

        newObject.frequency = params.frequency || 440;

        oscillator = synth.phaseDistortionOscillator({
            voice: newObject, 
            patch: synth.patch.osc
        });
//        oscillator.setFrequency(frequency);

        isActive = function () {
            return active === true;
        };
        newObject.mute = function () {
            active = false;
            // kill oscillators...
        };
        newObject.getKeyDownTime = function () {
            return keyDownTime;
        };
        newObject.getKeyUpTime = function () {
            return keyUpTime;
        };
        newObject.getSignal = function (buffer) {
            return oscillator.getSignal(buffer);
        };
        newObject.end = function () {
            keyUpTime = (new Date()).getTime();
        };
        newObject.voiceId = ++voiceId;
        return newObject;
    };

    getDroppableVoiceIndex = function () {
        // voices triggered by keys that have been released are dropped first
        // if there are no such voices, drop the voice triggered by the key first pressed

        var firstDown = Number.MAX_VALUE,
            firstUp = Number.MAX_VALUE,
            i,
            droppable;

        for (i = 0; i < voices.length; i += 1) {
            if (voices[i].getKeyUpTime() && voices[i].getKeyUpTime() < firstUp) {
                // the voice was triggered by a key that has been released
                firstUp = voices[i].getKeyUpTime();
                droppable = i;
            } else if (firstUp === Number.MAX_VALUE && voices[i].getKeyDownTime() < firstDown) {
                // no released keys' voices found so far: comparing keyDown times
                firstDown = voices[i].getKeyDownTime();
                droppable = i;
            }
        }
        return droppable;
    };

    dropVoice = function () {
        // drop the least important voice
        if (voices.length > 0) {
            var dropped = voices.splice(getDroppableVoiceIndex(), 1);
            dropped[0].mute();
            PubSub.publish('voice.dropped', {voiceId: dropped[0].voiceId});
            delete dropped[0];
            if (voices.length === 0) {
                synth.lfo1.reset();
                synth.lfo2.reset();
            }
        }
    };

    startVoice = function (frequency) {
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

    var eventLogger = function (event, data) {
            console.log('captured event: ' + event);
            console.log(data);
    };
    var keyDownHandler = function (event, data) {
        var v = startVoice(data.frequency);
        PubSub.publish('voice.started', {causedById: data.eventId, causedBy: event, voiceId: v.voiceId});
    };
    var keyUpHandler = function (event, data) {
        var i, j, v;
        for (i = 0, j = voices.length; i < j; i += 1) {
            v = voices[i];
            if (data.voiceId === v.voiceId) {
                v.end();
                PubSub.publish('voice.ended', {causedById: data.eventId, causedBy: event, voiceId: v.voiceId});
                return;
            }
        }
        PubSub.publish('voice.ended', {causedById: data.eventId, causedBy: event, voiceId: data.voiceId});
    };

    PubSub.subscribe('control.change.keyboard.keyDown', keyDownHandler);
    PubSub.subscribe('control.change.keyboard.keyUp', keyUpHandler);
    return synth;
})(kaci);
