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
	    cursorPosition,
	    sizeInPixels,
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

        exponential = function(inValue) {
            return Math.pow(inValue, exponent);
        };
        inverseExponential = function(inValue) {
            return Math.pow(inValue, 1 / exponent);
        };

	    params.width = params.width || '50px';
	    params.height = params.height || '300px';
        controller = synth.svgControllerElement(params);

        update = function () {
	        var position = inverseExponential((data[controlledValue] - minValue) / maxValue);
	        valueIndicator.setAttribute("cy", position * 100 + "%");
        };
        cursorPosition = function (event) {
	        var x, y, offsetAnchestor;

	        if (event.pageX && event.pageY) {
		        x = event.pageX;
		        y = event.pageY;
	        } else {
		        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	        }
	        offsetAnchestor = controller.parentNode;

            while(offsetAnchestor) {
	            x -= offsetAnchestor.offsetLeft;
	            y -= offsetAnchestor.offsetTop;
	            offsetAnchestor = offsetAnchestor.offsetParent;
            }
	        return {'x': x, 'y': y};
        };

        sizeInPixels = function () {
	        var unit, height, width;
	        unit = controller.height.baseVal.SVG_LENGTHTYPE_PX;
	        controller.height.baseVal.convertToSpecifiedUnits(unit);
	        controller.width.baseVal.convertToSpecifiedUnits(unit);
	        height = controller.height.baseVal.valueInSpecifiedUnits;
	        width = controller.width.baseVal.valueInSpecifiedUnits;
	        return {'width': width, 'height': height};
        };
        changeHandler = function (event) {
            var pixelCoordinates, svgSize, factor;
	        pixelCoordinates = cursorPosition(event);
	        svgSize = sizeInPixels();
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
            changeHandler(event.changedTouches[0]);
            return false;
        };

        touchMoveHandler = function (event) {
            var position, size;
            if (touched) {
                event.preventDefault();
                event.stopPropagation();
                position = cursorPosition(event.changedTouches[0]);
                size = sizeInPixels();
                
                if (position.x < 0 || position.y < 0 || position.x >= size.width || position.y >= size.height) {
                    return touchLeaveHandler(event);
                }
                
                changeHandler(event.changedTouches[0]);
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


	    controller.addEventListener('mousedown', mouseDownHandler.bind(this), false);
	    controller.addEventListener('mouseup', mouseUpHandler.bind(this), false);
	    controller.addEventListener('mouseover', mouseOverHandler.bind(this), false);
	    controller.addEventListener('mouseout', mouseOutHandler.bind(this), false);
	    controller.addEventListener('mousemove', mouseMoveHandler.bind(this), false);
	
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
