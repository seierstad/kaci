var
	noteOnTime, 
	noteOffTime,
	envelopeData,
	envelope;
	
envelopeData = {
	'envelope': [[0, 0.001], [0.02, 0.1], [1, 0.6]], 
	'duration': 3000,
	'sustain': {
		'startIndex': 1, 
		'endIndex': 1
	}
};

envelope = function(onTime, offTime) {
	var 
		i, 
		now,
		currentDuration,
		currentDurationScaled;
		
	now = new Date().getTime();
	currentDuration = now - onTime;
	currentDurationScaled = currentDuration / envelopeData.duration;
	
	for (i = 0; i < envelopeData.envelope.length-1; i++) {
		if (currentDurationScaled > envelopeData.envelope[i][0] && currentDurationScaled < envelopeData.envelope[i+1][0]) {
			var linear = linearFunctionFromPoints([envelopeData.envelope[i], envelopeData.envelope[i+1]]);
			return (linear.rate * currentDurationScaled) + linear.constant;
		}
	}
	return 0;

};
