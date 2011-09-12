var kaci = kaci || {};

// add audio output
(function(synth){

    if(document.webkitAudioContext || document.audioContext) {
        alert('Your browser is not yet supported');
    }

    var output = (function() {
        var audioElement = new Audio(), 
            currentWritePosition = 0, 
            prebufferSize = synth.sampleRate / 2, 
            tail,
            getAudio,
            enable, 
            disable,
            timerID,
            setReadFunction,
            readFunction;
            
        audioElement.mozSetup(1, synth.sampleRate);
        
        getAudio = function() {
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
        enable = function() {
            timerID = setInterval(getAudio, 100);
        };
        disable = function() {
            clearInterval(timerID);
        };
        setReadFunction = function(fn) {
            if (typeof fn === 'function') {
                readFunction = fn;
            }
        };
        return {
            enable: enable,
            disable: disable,
            setReadFunction: setReadFunction,
            readFunction: readFunction
        };        
    })();

    if (!synth.audioOutput) {
        synth.audioOutput = output;
    }
    return synth;
})(kaci);

