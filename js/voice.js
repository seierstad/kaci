var kaci = kaci || {};

(function (synth) {
    var getDroppableVoiceIndex,
        dropVoice,
        getKeyDownTime,
        getKeyUpTime,
        getSignal,
        voice, // constructor for new voices
        setupVoices,
        startVoice, // public method
        endVoice,
        maxVoiceCount = 5, // limit concurrent voices
        voices = [], // the currently active voices
        voiceId = 0,
        noteId = 0,
        bufferSize = 1024;

    voice = function (params) {
        var params = params || {},
            newObject = {},
            active = params.active || false,
            isActive,
            mute,
            keyDownTime,
            keyUpTime = null,
            oscillator,
            voiceBuffer = new Float32Array(bufferSize);

        /*        oscillator = synth.phaseDistortionOscillator({
            voice: newObject, 
            patch: synth.patch.osc
        });
*/
        oscillator = new Worker('js/workerOscillator.js');
        //        oscillator.setFrequency(frequency);
        oscillator.active = false;
        oscillator.voice = newObject;
        oscillator.postMessage({
            cmd: 'setup',
            sampleFreq: params.sampleFreq,
            bufferSize: 1024
        });
        oscillator.addEventListener('message', function (e) {
            if (e.data.cmd) {
                switch (e.data.cmd) {
                case 'setStatus':
                    if (e.data.msg === 'inactive') {
                        this.active = false;
                    } else if (e.data.msg === 'active') {
                        this.postMessage({
                            cmd: 'fillBuffer',
                            size: bufferSize
                        });
                        this.active = true;
                    }
                    break;
                default:
                    //                        console.log('voice ' + this.voice.voiceId + ': unsupported command');
                    //                        console.log(e.data);
                }
            } else if (e.data.msg) {
                //                console.log('voice ' + this.voice.voiceId + ':');
                //                console.log(e.data.msg);
            } else if (e.data.d) {
                voiceBuffer = e.data.d;
                //                console.log('data');
                //                console.log(e.data.d);
            }
        }, false);
        newObject.isActive = function () {
            return oscillator.active;
        };
        newObject.mute = function () {
            oscillator.active = false;
            keyDownTime = null;
            keyUpTime = null;
        };
        newObject.getKeyDownTime = function () {
            return keyDownTime;
        };
        newObject.getKeyUpTime = function () {
            return keyUpTime;
        };
        newObject.getSignal = function (size) {
            var i, j, buffer = new Float32Array(size);
            if (this.isActive()) {

                for (i = 0, j = size; i < j; i += 1) {
                    buffer[i] = voiceBuffer[i];
                }
                oscillator.postMessage({
                    cmd: 'fillBuffer',
                    size: size
                });

                return buffer;
            }
        };
        newObject.start = function (frequency) {
            keyUpTime = null;
            keyDownTime = (new Date()).getTime();
            oscillator.postMessage({
                cmd: 'keydown',
                frequency: frequency
            });
            this.noteId = ++noteId;

            // test setFrequency
            // var newFreq = frequency;
            // setTimeout(function () {oscillator.postMessage({cmd: 'setFrequency', frequency: newFreq + 200})}, 350);

        };
        newObject.end = function () {
            oscillator.postMessage({
                cmd: 'keyup'
            });
            keyUpTime = (new Date()).getTime();
        };
        newObject.voiceId = ++voiceId;
        return newObject;
    };
    setupVoices = function () {
        var i;
        for (i = 0; i < maxVoiceCount; i += 1) {
            voices.push(voice({
                sampleFreq: 44100
            }));
        }
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
    noActiveVoices = function () {
        var i;
        for (i = 0; i < voices.length; i += 1) {
            if (voices[i].isActive()) {
                return false;
            }
        }
        return true;
    },
    dropVoice = function () {
        var voice = voices[getDroppableVoiceIndex()];

        voice.mute();
        PubSub.publish('voice.dropped', {
            voiceId: voice.voiceId,
            noteId: voice.noteId
        });
        if (noActiveVoices()) {
            synth.lfo1.reset();
            synth.lfo2.reset();
        }
        return voice;
    };

    startVoice = function (frequency) {
        var i = 0,
            availableVoice;

        /*        while (voices.length >= maxVoiceCount) {
            dropVoice();
        }
*/
        for (i = 0; i < voices.length; i += 1) {
            if (!voices[i].isActive()) {
                availableVoice = voices[i];
                break;
            }
        }
        if (!!!availableVoice) {
            availableVoice = dropVoice();
        }
        availableVoice.start(frequency);

        return availableVoice;
    };
    synth.voices = voices; // todo: remove this after debugging
    synth.startVoice = startVoice;
    synth.dropVoice = dropVoice;

    var keyDownHandler = function (event, data) {
        var v = startVoice(data.frequency);
        PubSub.publish('voice.started', {
            causedById: data.eventId,
            causedBy: event,
            voiceId: v.voiceId,
            noteId: v.noteId
        });
    };
    var keyUpHandler = function (event, data) {
        var i, j, v;
        for (i = 0, j = voices.length; i < j; i += 1) {
            v = voices[i];
            if (data.noteId === v.noteId) {
                v.end();
                PubSub.publish('voice.ended', {
                    causedById: data.eventId,
                    causedBy: event,
                    voiceId: v.voiceId,
                    noteId: v.noteId
                });
                return;
            }
        }
        PubSub.publish('voice.ended', {
            causedById: data.eventId,
            causedBy: event,
            voiceId: data.voiceId,
            noteId: v.noteId
        });
    };
    setupVoices();
    PubSub.subscribe('control.change.keyboard.keyDown', keyDownHandler);
    PubSub.subscribe('control.change.keyboard.keyUp', keyUpHandler);
    return synth;
})(kaci);
