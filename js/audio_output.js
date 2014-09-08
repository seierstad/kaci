var kaci = kaci || {};

// add audio output
(function (synth) {

    var output = (function () {
        var audioElement = new Audio(),
            currentWritePosition = 0,
            prebufferSize = synth.sampleRate / 2,
            tail,
            getAudio,
            enable,
            disable,
            timerID,
            setReadFunction,
            readFunction,
            context,
            audioNode;

        setReadFunction = function (fn) {
            if (typeof fn === 'function') {
                readFunction = fn;
            }
        };

        if (typeof audioElement.mozSetup === 'function') {
            audioElement.mozSetup(1, synth.sampleRate);

            getAudio = function () {
                var written, soundData, currentPosition, available;

                if (tail) {
                    written = audioElement.mozWriteAudio(tail);
                    currentWritePosition += written;
                    if (written < tail.length) {
                        // Not all the data was written, saving the tail...
                        tail = (tail.subarray ? tail.subarray(written) : tail.slice(written));
                        return; // ... and exit the function.
                    }
                    tail = null;
                }
                currentPosition = audioElement.mozCurrentSampleOffset();
                available = currentPosition + prebufferSize - currentWritePosition;

                if (available > 0) {
                    // Request some sound data from the callback function.
                    soundData = new Float32Array(parseFloat(available));
                    readFunction(soundData);

                    // Writing the data.
                    written = audioElement.mozWriteAudio(soundData);
                    if (written < soundData.length) {
                        // Not all the data was written, saving the tail.
                        tail = (soundData.subarray ? soundData.subarray(written) : soundData.slice(written));
                    }
                    currentWritePosition += written;
                }
            };
            enable = function () {
                timerID = setInterval(getAudio, 100);
            };
            disable = function () {
                clearInterval(timerID);
            };
            return {
                enable: enable,
                disable: disable,
                setReadFunction: setReadFunction,
                readFunction: readFunction
            };
        } else if (typeof window.AudioContext === 'function' || typeof window.webkitAudioContext === 'function') {

            var ac = window.AudioContext || window.webkitAudioContext;
            context = new ac();
            audioNode = context.createScriptProcessor(1024, 1, 2);

            enable = function () {
                audioNode.connect(context.destination);
            };

            disable = function () {
                audioNode.disconnect();
            };

            audioNode.onaudioprocess = function (event) {
                var right, left, bufferLength, i;
                right = event.outputBuffer.getChannelData(0);

                readFunction(right);
            };
            return {
                enable: enable,
                disable: disable,
                context: context,
                node: audioNode,
                setReadFunction: setReadFunction
            };
        } else {
            return null;
        }
    })();

    if (!synth.audioOutput) {
        synth.audioOutput = output;
    }
    return synth;
})(kaci);
