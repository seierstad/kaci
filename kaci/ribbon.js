var kaci = kaci || {};

(function(synth) {
    var ribbonController;
    ribbonController = function (params) {
        var params = params || {},
        data = params.dataObject,
        controlledValue = params.controlledValue,
	    minValue = params.minValue || 0,
	    maxValue = params.maxValue || 1,
	    callback = params.callback,
	    draggable = false,
	    scrollable = false,
	    touched = false,
	    exponent = params.exponent || 1,

	    controller,
	    position,
	    valueIndicator,
	    
	    svgns = 'http://www.w3.org/2000/svg',
	    pointRadius = '10px',
	    
	    // private functions:
	    changeHandler,
	    mouseDownHandler,
	    mouseUpHandler, 
	    mouseMoveHandler,
	    scrollHandler,
	    mouseOverHandler,
	    mouseOutHandler,
	    touchStartHandler,
	    touchMoveHandler,
	    touchEndHandler,
	    touchLeaveHandler,
	    exponential,
	    inverseExponential,
	    
	    // public functions:
	    update;

	    params.width = params.width || '50px';
	    params.height = params.height || '300px';
        controller = synth.svgControllerElement(params);

        exponential = function(inValue) {
            return Math.pow(inValue, exponent);
        };

        inverseExponential = function(inValue) {
            return Math.pow(inValue, 1 / exponent);
        };

        update = function () {
	        var position = inverseExponential((data[controlledValue] - minValue) / maxValue);
	        valueIndicator.setAttribute("cy", position * 100 + "%");
        };

        changeHandler = function (event, touch) {
            var pixelCoordinates, svgSize, factor;
	        pixelCoordinates = synth.cursorPosition(event, touch);
	        svgSize = synth.sizeInPixels(controller);
	        factor = exponential(pixelCoordinates.y / svgSize.height);
	        data[controlledValue] = minValue + ((maxValue - minValue) * factor);
	        if (typeof callback === "function") {
		        callback(data[controlledValue]);
	        }
	        update();
	        return false;
        };

        mouseDownHandler = function (event) {
	        draggable = true;
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

        scrollHandler = function (event) {
	        if (scrollable) {
		        event.stopPropagation();
		        event.preventDefault();
	            var increase = data[controlledValue] * event.detail / 100;
		        if ((data[controlledValue] + increase) > minValue && (data[controlledValue] + increase) <= maxValue) {
			        data[controlledValue] = data[controlledValue] += increase;
			        if (typeof callback === "function") {
				        callback(data[controlledValue]);
			        }
			        update();
		        }
	        }
        };
        mouseOverHandler = function (event) {
	        event.preventDefault();
	        event.stopPropagation();
	        scrollable = true;
        };
	
        mouseOutHandler = function (event) {
	        event.preventDefault();
	        event.stopPropagation();
	        if (event.target.nodeName === 'svg' || event.target.nodeName === 'rect') {
		        draggable = false;
		        scrollable = false;
	        }
        };

        touchStartHandler = function (event) {
            touched = true;
            changeHandler(event, event.changedTouches[0]);
            return false;
        };

        touchMoveHandler = function (event) {
            var position, size;
            if (touched) {
                event.preventDefault();
                event.stopPropagation();
                position = synth.cursorPosition(event, event.changedTouches[0]);
                size = synth.sizeInPixels(controller);
                
                if (position.x < 0 || position.y < 0 || position.x >= size.width || position.y >= size.height) {
                    return touchLeaveHandler(event);
                }
                
                changeHandler(event, event.changedTouches[0]);
            }
            return false;
        };
        
        touchEndHandler = function (event) {
            touched = false;
            return false;
        };

        touchLeaveHandler = function (event) {
            touched = false;
            return false;
        };

	    position = (data[controlledValue] - minValue) / maxValue;
	    valueIndicator = document.createElementNS(svgns, "circle");
	    valueIndicator.setAttribute("cx", "50%");
	    valueIndicator.setAttribute("r", pointRadius);
	    valueIndicator.setAttribute("fill", "#336699");
	    update();
	    controller.appendChild(valueIndicator);
        
    	controller.addEventListener('touchstart', touchStartHandler, false);
    	controller.addEventListener('touchmove', touchMoveHandler, false);
    	controller.addEventListener('touchend', touchEndHandler, false);
    	controller.addEventListener('touchcancel', touchEndHandler, false);
    	controller.addEventListener('touchleave', touchLeaveHandler, false);


	    controller.addEventListener('mousedown', mouseDownHandler, false);
	    controller.addEventListener('mouseup', mouseUpHandler, false);
	    controller.addEventListener('mouseover', mouseOverHandler, false);
	    controller.addEventListener('mouseout', mouseOutHandler, false);
	    controller.addEventListener('mousemove', mouseMoveHandler, false);
	
	    window.addEventListener('DOMMouseScroll', scrollHandler, false);
	    window.addEventListener('mousewheel', scrollHandler, false);


        return {
            update: update
        }
    }
/*
	
    */
    synth.ribbon = ribbonController;
    return synth;
})(kaci);
