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
			setValueAtIndex,
			setLastValue,
            
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
		setValueAtIndex = function(value, index) {
			if (index < data.length) {
				data[index][1] = value;
			}
		};
		setLastValue = function(value) {
			setValueAtIndex(value, data.length - 1);
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
                pointRadius = '10',
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
                mouseHandler,
                touchHandler,
        
                // public functions:
                update;

            params.width = params.width || '300px';
            params.height = params.height || '300px';
            controller = synth.svgControllerElement(params);
            svgCircleGroup = synth.svg('g', {'class': 'circles'});
            svgLineGroup = synth.svg('g', {'class': 'lines'});      

            circle = function(position, params) {
                var params = params || {},
                	radius = params.radius || pointRadius,
                    className = params.className,
                    svgCircle = params.svgCircle || document.createElementNS(svgns, "circle");
                    
                svgCircle.setAttribute("cx", (position.x * 100).toString() + "%");
                svgCircle.setAttribute("cy", (position.y * 100).toString() + "%");
                svgCircle.setAttribute("r", radius + "px");
                if (className) {
                    svgCircle.setAttribute("class", className);
                }
                return svgCircle;
                svgCircle.addEventListener("dragstart", dragHandler, false);
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
                        svgCircle = circle(position);
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
            changeHandler = function (event, touch) {
                var pixelCoordinates, svgSize, svgCircleGroup, newData, viewUpdate, circleIndex, circleDraggable, index, i = 0;
                pixelCoordinates = synth.cursorPosition(event, touch);
                svgSize = synth.sizeInPixels(controller);
                newData = {
                    x: pixelCoordinates.x / svgSize.width, 
                    y: 1 - pixelCoordinates.y / svgSize.height 
                };

                circleIndex = function(event, touch) {
                    var p = touch || event;
                    for (i = 0; p.target !== points[i].circle && i + 1 < points.length; i += 1);
                    if (p.target === points[i].circle) {
                        return i;
                    }
                    return -1;
                };
                
                circleDraggable = function(index) {
                    points[index].draggable = true;
                    points[index].circle.setAttribute("r", pointRadius*3 + "px");                            
                };
                
                viewUpdate = function() {
                    update();
                    if (typeof callback === "function") {
                        callback();
                    }
                };


                switch (event.type) {
                    case "touchstart":
                    case "mousedown":
                        if (event.target.tagName === "rect") {
                            for (i = 0; newData.x > data[i][0] && i < data.length; i += 1);
                            data.splice(i, 0, [newData.x, newData.y]);
                            viewUpdate();
                            circleDraggable(i);
                        } else if (event.target.tagName === "circle") {
                            index = circleIndex(event);
                            if (event.ctrlKey) {
                                if (index > 0 && index + 1 < points.length) {
                                    data.splice(index, 1);
                                    viewUpdate();
                                }
                            } else {
	                            circleDraggable(index);
                            }
                        }
                        break;
                    case "touchend":
                    case "touchcancel":    
                    case "mouseup":
                        index = circleIndex(event);
                        if (points[index] && points[index].draggable) {
                            points[index].draggable = false;
                            points[index].circle.setAttribute("r", pointRadius + "px");
                        }
                        break;
                    case "touchmove":
                        if (pixelCoordinates.x < 0 
                                || pixelCoordinates.y < 0 
                                || pixelCoordinates.x >= svgSize.width 
                                || pixelCoordinates.y >= svgSize.height) {
                                
                            return touchLeaveHandler(event);
                        }
                    case "touchmove":
                    case "mousemove":
                        if (event.target.tagName === "circle") {
                            event.preventDefault();
                            event.stopPropagation();
                            index = circleIndex(event);

                            if (points[index] && points[index].draggable) {
                                points[index].data[1] = newData.y;
                                points[index].circle.setAttribute("cy", ((1 - newData.y) * 100).toString() + "%");
                                if (points[index].line) {
                                    points[index].line.setAttribute("y2", ((1 - newData.y) * 100).toString() + "%");
                                }
                                if (index + 1 < points.length && points[index + 1].line) {
                                    points[index + 1].line.setAttribute("y1", ((1 - newData.y) * 100).toString() + "%");
                                }

                                if(index > 0 && index + 1 < points.length) {
                                    points[index].data[0] = newData.x;
                                    points[index].circle.setAttribute("cx", (newData.x * 100).toString() + "%"); 
                                    if (points[index].line) {
                                        points[index].line.setAttribute("x2", (newData.x * 100).toString() + "%");
                                    }
                                    if (index + 1 < points.length && points[index + 1].line) {
                                        points[index + 1].line.setAttribute("x1", (newData.x * 100).toString() + "%");
                                    }
                                }
                                if (typeof callback === "function") {
                                    callback();
                                }
                            }
                        }
                        break;
                }
                return false;
            };

            mouseHandler = function (event) {
               changeHandler(event);
            };

            touchHandler = function (event) {
                changeHandler(event, event.changedTouches[0]);
                return false;
            };

            update();
            
            this.view = {
                update: update
            };
            controller.addEventListener('mousedown', mouseHandler, false);
    	    controller.addEventListener('mouseup', mouseHandler, false);
    	    controller.addEventListener('mousemove', mouseHandler, false);
            controller.addEventListener('touchstart', touchHandler, false);
    	    controller.addEventListener('touchend', touchHandler, false);
    	    controller.addEventListener('touchcancel', touchHandler, false);
    	    controller.addEventListener('touchmove', touchHandler, false);
    	    
    	    

        };        
        
        return {
            getValueAtPhase: getValueAtPhase,
            addPoint: addPoint, 
            removePoint: removePoint,
            setData: setData,
            getData: getData,
			setValueAtIndex: setValueAtIndex,
			setLastValue: setLastValue,
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
            setSustainValue,
            test,
            view,
            initView;

            beforeSustain.envelope = beforeSustain.envelope || envelope({data: beforeSustain.data});
            afterSustain.envelope = afterSustain.envelope || envelope({data: afterSustain.data});
		
		setSustainValue = function(value) {
			if (sustain.enabled) {
				sustain.value = value;
				beforeSustain.envelope.setLastValue(value);
				afterSustain.envelope.setValueAtIndex(value, 0);
				
				beforeSustain.envelope.view.update();
				afterSustain.envelope.view.update();
			}
		};

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
            var duration = beforeSustain.duration,
                data = beforeSustain.envelope.getData(),
                beforeData,
                beforePart,
                afterData,
                afterPart,
                i;
                
            if (index < data.length) {
		        if (sustain.enabled) {
		            removeSustain();
		        }

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
	            view.update();
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
                view.update();
            }

            return this;
        };
        
        initView = function (params) {

	        var controller, 
	        	sustainController, 
	        	defs,
	        	mask, 
	        	maskbg, 
	        	maskText, 
	        	bar, 
	        	sustainOff, 
	        	svgns = 'http://www.w3.org/2000/svg', 
	        	xlinkns = 'http://www.w3.org/1999/xlink';
	        	
	        controller = synth.svgControllerElement(params);

	        params.container = controller;
	        params.width = "40%";
	        params.height = "90%";
            beforeSustain.envelope.initView(params);

            params.offsetX = "60%";
            afterSustain.envelope.initView(params);

	        params.width = "20%";
            params.offsetX = "40%";
            params.className = "sustain";
   	        sustainController = synth.svgControllerElement(params);
   	        sustain.value = (afterSustain.envelope.getData())[0][1];
 
			mask = synth.svg('mask', {id: 'mask', x: 0, y: 0, width: "100%", height: 20});
			maskbg = synth.svg('rect', {width: '100%', height: '100%', fill: 'white'});
   	        mask.appendChild(maskbg);
			maskText = synth.svg('text', {x: 0, y: 0, transform: 'translate(0 15)', fill: 'black'});
   	        maskText.textContent = "SUSTAIN";
   	        mask.appendChild(maskText);
			var offBg = synth.svg("circle", {cx: "100%", cy: 10, r: 7.5, transform: "translate(-7.5 0)"});
   	        mask.appendChild(offBg);
   	        sustainController.appendChild(mask);
   	        
			defs = document.createElementNS(svgns, "defs");
			bar = synth.svg('g', {id: 'sustainBar'});
			rect = synth.svg('rect', {width: '100%', height: 20, x: 0, y: 0, mask: 'url(#mask)', 'class': 'bar'});
			bar.appendChild(rect);
			
			off = synth.svg('g', {id: 'off'});
			offTarget = synth.svg('circle', {id: 'target', cx: 7.5, cy: 7.5, r: 7.5, opacity: 0});
			off.appendChild(offTarget);
			var crossline1 = synth.svg('line', {x1: 3.5, y1: 3, x2: 11.5, y2: 12});
			off.appendChild(crossline1);
			var crossline2 = synth.svg('line', {x1: 3.5, y1: 12, x2: 11.5, y2: 3, fill: 'blue'});
			off.appendChild(crossline2);
			defs.appendChild(off);
			
			var useOff = synth.svg('use', {x: '100%', y: 2.5, transform: 'translate(-15 0)'});
			useOff.setAttributeNS(xlinkns,"xlink:href","#off");
			bar.appendChild(useOff);
			
			defs.appendChild(bar);
			sustainController.appendChild(defs);
			
			var sustainPercent = (sustain.value * 100).toString() + "%";

			var useBar = synth.svg('use', {x: 0, y: sustainPercent, transform: 'translate(0 -10)'});
			useBar.setAttributeNS(xlinkns,"xlink:href","#sustainBar");	

   	        sustainController.appendChild(useBar);
   	        

			
			
			
            view = {
            	sustain: sustain,
                beforeSustain: beforeSustain.envelope.view,
                afterSustain: afterSustain.envelope.view,
                update: function(){
                	if (sustain.enabled) {
                		console.log('enabled');
                	} else {
                		console.log('disabled');
                	}
                }
            }
        };
		test = function(value){
			setSustainValue(value);
		};
		
        return {
            addSustain: addSustain,
            removeSustain: removeSustain,
            getValueAtTime: getValueAtTime,
            isFinishedAtTime: isFinishedAtTime,
            initView: initView,
            test: test
        };
    };
    synth.keyEnvelope = keyEnvelope;
    synth.envelope = envelope;
    
    return synth;
})(kaci);

