var kaci = kaci || {};

(function(synth) {

    var envelope, keyEnvelope;
    
    envelope = function(params) {
        var params = params || {},
            patch = params.patch || {}, 
            data = patch.data || params.data || params.envelopeData || [[0, 0], [1, 1]],
            linearFunctionFromPoints,
            getValueAtPhase,
            addPoint, 
            removePoint,
            setData,
            getData,
            init,
            view;

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
            removePoint = function(index) {
            
            };
            
            setData = function(points) {
                data = points;
                return this;
            };
            
            getData = function() {
                return data;
            };
            
            
            initView = function (params) {
                var params = params || {},
	                minValue = params.minValue || 0,
	                maxValue = params.maxValue || 1,
	                callback = params.callback,
	                draggable = false,
                    touched = false,

                    controller,
                    valueIndicator,
	            
	                points = [],
                    svgns = 'http://www.w3.org/2000/svg',
                    pointRadius = '10px',
                    lineWidth = 2,
                    position,
                    line,
                    circle,
                    svgCircle,
                    svgCircleGroup,
                    svgLine,
                    svgLineGroup,
                    i,
	            
                    // private functions: (to be refactored to a common svg functions class)
                    sizeInPixels,
                    changeHandler,
                    mouseDownHandler,
                    mouseUpHandler,
                    mouseMoveHandler,
                    doubleClickHandler,
            
                    // public functions:
                    update;

	            params.width = params.width || '300px';
	            params.height = params.height || '300px';
                controller = synth.svgControllerElement(params);
                svgCircleGroup = document.createElementNS(svgns, "g");
                svgLineGroup = document.createElementNS(svgns, "g");
                
                circle = function(position, params) {
                    var radius = params.radius || pointRadius,
                        className = params.className,
                        svgCircle = params.svgCircle || document.createElementNS(svgns, "circle");
                        
                    svgCircle.setAttribute("cx", (position.x * 100).toString() + "%");
                    svgCircle.setAttribute("cy", (position.y * 100).toString() + "%");
                    svgCircle.setAttribute("r", radius);
                    if (className) {
                        svgCircle.setAttribute("class", className);
                    }
                    return svgCircle;
                };
                
                line = function(startPosition, endPosition, params) {
                    var params = params || {},
                        className = params.className,
                        svgLine = params.svgLine || document.createElementNS(svgns, "line");
                        
                    svgLine.setAttribute("x1", (startPosition.x * 100).toString() + "%");
                    svgLine.setAttribute("y1", (startPosition.y * 100).toString() + "%");
                    svgLine.setAttribute("x2", (endPosition.x * 100).toString() + "%");
                    svgLine.setAttribute("y2", (endPosition.y * 100).toString() + "%");
                    if (className) {
                        svgLine.setAttribute("class", className);
                    }
                    return svgLine;
                };

                
                update = function () {
                    var previousPosition, i, circleGroup, lineGroup;
                    
                    for (i = 0; i < data.length; i += 1) {
                        position = {x: data[i][0], y: 1 - (data[i][1] - minValue) / maxValue};

                        if (i < points.length && points[i].circle) {
                            circle(position, {svgCircle: points[i].circle});
                            if (points[i].line) {
                                line(previousPosition, position, {svgLine: points[i].line});
                            }
                            points[i].data = data[i];
                        } else {
                            svgCircle = circle(position, {className: 'pdDataPoint'});
                            svgCircleGroup.appendChild(svgCircle);
                            points[i] = {circle: svgCircle, data: data[i]};
                            if (i > 0) {
                                svgLine = line(previousPosition, position);
                                svgLineGroup.appendChild(svgLine);
                                points[i].line = svgLine;
                            }
                        }
                        previousPosition = position;
                    }
                    if (data.length < points.length) {
                        circleGroup = points[0].circle.parentNode;
                        lineGroup = points[1].line.parentNode;
                        
                        for (i = data.length; i < points.length; i += 1) {
                            circleGroup.removeChild(points[i].circle);
                            lineGroup.removeChild(points[i].line);
                        }
                        
                        points.splice(data.length, points.length - data.length);
                    }
                    controller.appendChild(svgLineGroup);
                    controller.appendChild(svgCircleGroup);
                    return this;
                };

                changeHandler = function (event) {
                    var pixelCoordinates, svgSize, svgCircleGroup, newData, i = 0;
	                pixelCoordinates = synth.cursorPosition(event);
	                svgSize = synth.sizeInPixels(controller);
	                newData = {
	                    x: pixelCoordinates.x / svgSize.width, 
	                    y: 1 - pixelCoordinates.y / svgSize.height 
	                };
	                //factor = exponential(pixelCoordinates.y / svgSize.height);
	                if (event.target.tagName === "rect") {
                        for (i = 0; newData.x > data[i][0] && i < data.length; i += 1);
                        data.splice(i, 0, [newData.x, newData.y]);
    	                update();
		                if (typeof callback === "function") {
			                callback();
		                }
                    } else if (event.target.tagName === "circle") {
                        if (event.ctrlKey) {
                            for (i = 0; event.target !== points[i].circle && i + 2 < points.length; i += 1);
                            if (i > 0 && event.target === points[i].circle) {
                                data.splice(i, 1);
                                update();
                                if (typeof callback === "function") {
			                        callback();
		                        }
                            }
                        }
	                }
	                return false;
                };

                mouseDownHandler = function (event) {
	                changeHandler(event);
                };

                mouseUpHandler = function (event) {
	                draggable = false;
                };

                mouseMoveHandler = function (event) {
	                if (draggable === true) {
		                changeHandler(event);
	                }
                };
                doubleClickHandler = function (event) {
                    alert(event.target);
                };
                
                update();
                
                this.view = {
                    update: update
                };
	            controller.addEventListener('mousedown', mouseDownHandler, false);
        	    controller.addEventListener('mouseup', mouseUpHandler, false);
        	    controller.addEventListener('dblclick', doubleClickHandler, false);
            };        
            
            
            
            return {
                getValueAtPhase: getValueAtPhase,
                addPoint: addPoint, 
                removePoint: removePoint,
                setData: setData,
                getData: getData,
                initView: initView,
                view: view
            };

    };
    
    keyEnvelope = function(params) {
        var params = params || {},
            patch = params.patch || {},
            beforeSustain = patch.beforeSustain || params.beforeSustain || {
                envelope: envelope({data: [[0,1],[1,0.5]]}),
                duration: 300,
            },
            sustain = patch.sustain || params.sustain || {
                value: 0.5,
                enabled: true
            },
            afterSustain = patch.afterSustain || params.afterSustain || {
                envelope: envelope({data: [[0,0.5],[1,0]]}), 
                duration: 600
            },
            getValueAtTime,
            addSustain,
            removeSustain,
            setDurationBeforeSustain,
            setDurationAfterSustain,
            view,
            init;

            beforeSustain.envelope = beforeSustain.envelope || envelope({data: beforeSustain.data});
            afterSustain.envelope = afterSustain.envelope || envelope({data: afterSustain.data});

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
        
        initView = function () {
            beforeSustain.envelope.initView();
            afterSustain.envelope.initView();
            this.view = {
                beforeSustain: beforeSustain.envelope.view,
                afterSustain: afterSustain.envelope.view,
                update: function(){alert('todo')}
            }
        };

        return {
            addSustain: addSustain,
            removeSustain: removeSustain,
            getValueAtTime: getValueAtTime,
            isFinishedAtTime: isFinishedAtTime,
            initView: initView,
            view: view
        };
    };
    synth.keyEnvelope = keyEnvelope;
    synth.envelope = envelope;
    
    return synth;
})(kaci);

