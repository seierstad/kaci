var kaci = kaci || {};

(function(synth) {

    var envelope, keyEnvelope;
    
    envelope = function(params) {
        var params = params || {}, 
            data = params.data || params.envelopeData || [[0, 0], [1, 1]],
            linearFunctionFromPoints,
            getValueAtPhase,
            addPoint, 
            removePoint,
            setData,
            getData;

            linearFunctionFromPoints = function (points) {
			    var rate, constant;
			    rate = (points[1][1] - points[0][1]) / (points[1][0] - points[0][0]);
			    constant = points[0][1] - ( rate * points[0][0] );
			    return {rate: rate, constant: constant};
		    };
		
            getValueAtPhase = function (phase) {
			    var line, i;
			    if (data.length > 1) {
				    for (i = 1; i < data.length; i++) {
					    if (phase >= data[i-1][0] && phase < data[i][0]) {
						    line = linearFunctionFromPoints([data[i-1], data[i]]);
						    return (phase * line.rate) + line.constant;
					    }
				    }
			    } 
		    };
            
            addPoint = function(point) {
            
            };
            removePoint = function() {
            
            };
            
            setData = function(points) {
                data = points;
                return this;
            };
            
            getData = function() {
                return data;
            };
            return {
                getValueAtPhase: getValueAtPhase,
                addPoint: addPoint, 
                removePoint: removePoint,
                setData: setData,
                getData: getData
            };

    };
    
    keyEnvelope = function(params) {
        var params = params || {},
            beforeSustain = params.beforeSustain || {
                envelope: envelope({data: [[0,0],[0.5,1],[1,0.5]]}),
                duration: 300,
            },
            sustain = params.sustain || {
                value: 0.5,
                enabled: true
            },
            afterSustain = params.afterSustain || {
                envelope: envelope({data: [[0,0.5],[0.4,1],[0.6,0.2],[1,0]]}), 
                duration: 600
            },
            getValueAtTime,
            addSustain,
            removeSustain,
            setDurationBeforeSustain,
            setDurationAfterSustain;

        getValueAtTime = function(params) {
            var params = params || {},
                startTime = params.start,
                endTime = params.end,
                timeLeft;
            
            if (endTime && sustain.enabled && afterSustain.duration > 0) {
                timeLeft = afterSustain.duration - endTime;
                if (timeLeft <= 0) {
                    return 0;
                }
                return afterSustain.envelope.getValueAtPhase(1 - (timeLeft / afterSustain.duration));
            } else {
                timeLeft = beforeSustain.duration - startTime;
                if (timeLeft <= 0) {
                    return sustain.enabled ? sustain.value : 0;
                }
                return beforeSustain.envelope.getValueAtPhase(1 - (timeLeft / beforeSustain.duration));
            }
        };
        
        isFinishedAtTime = function(params) {
            var params = params || {},
                startTime = params.start,
                endTime = params.end,
                timeLeft;
            
            if (endTime && sustain.enabled && afterSustain.duration > 0) {
                timeLeft = afterSustain.duration - endTime;
                return (timeLeft <= 0);
            }
            if (sustain.enabled) {
                return false;
            }
            timeLeft = beforeSustain.duration - startTime;
            return (timeLeft <= 0);

        };
        
        addSustain = function(index) {
            if (sustain.enabled) {
                removeSustain();
            }
            var duration = beforeSustain.duration,
                data = beforeSustain.envelope.getData(),
                beforeData,
                beforePart,
                afterData,
                afterPart,
                i;
                
            if (index < data.length) {
                afterData = data.slice(index);
                beforeData = data.slice(0, index);
                beforeData.push(afterData[0].slice());
                
                beforePart = data[index][0];
                afterPart = 1 - beforePart;

                for (i = 0; i < beforeData.length; i += 1) {
                    beforeData[i][0] = beforeData[i][0] / beforePart;
                }
                for (i = 0; i < afterData.length; i += 1) {
                    afterData[i][0] = (afterData[i][0] - beforePart) / afterPart;
                }
                beforeSustain.envelope.setData(beforeData);
                afterSustain.envelope.setData(afterData);                
                beforeSustain.duration = duration * beforePart;
                afterSustain.duration = duration - beforeSustain.duration; // equals duration * afterPart
                sustain.enabled = true;
                sustain.value = data[index][1];
            }
            return this;
        };

        removeSustain = function() {
            if (sustain.enabled) {
                var duration = beforeSustain.duration + afterSustain.duration,
                    data,
                    beforeData = beforeSustain.envelope.getData(),
                    beforePart = beforeSustain.duration / duration,
                    afterData = afterSustain.envelope.getData(),
                    afterPart = 1 - beforePart,
                    i;
                    
                beforeData.pop();
                
                for (i = 0; i < beforeData.length; i += 1) {
                    beforeData[i][0] = beforeData[i][0] * beforePart;
                }
                for (i = 0; i < afterData.length; i += 1) {
                    afterData[i][0] = beforePart + (afterData[i][0] * afterPart);
                }
                data = beforeData.concat(afterData);
                beforeSustain.envelope.setData(data);
                beforeSustain.duration = duration;
                sustain.enabled = false;
            }

            return this;
        };

        return {
            addSustain: addSustain,
            removeSustain: removeSustain,
            getValueAtTime: getValueAtTime,
            isFinishedAtTime: isFinishedAtTime
        };
    };
    synth.keyEnvelope = keyEnvelope;
    synth.envelope = envelope;
    
    return synth;
})(kaci);

(function(synth) {
    synth.env1 = synth.keyEnvelope();
    synth.env2 = synth.keyEnvelope();

    return synth;
})(kaci);

