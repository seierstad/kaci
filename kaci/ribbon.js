var kaci = kaci || {};

(function (synth) {
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
            exponent = params.exponent || 1, // linear default

            controller,
            valueIndicator,
            invertedView,

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
            updateIndicatorPosition,

            // public functions:
            update;

        invertedView = !!(params.invertedView);
        params.width = params.width || '50px';
        params.height = params.height || '300px';
        controller = synth.svgControllerElement(params);
        valueIndicator = params.valueIndicator || (function () {
            var element = synth.svg("circle", {cx: "50%", r: pointRadius, fill: "#336699"});
            element.updatePosition = function (position) {
                element.setAttribute("cy", position * 100 + "%");
            };
            return element;
        })();

        exponential = function (inValue) {
            return Math.pow(inValue, exponent);
        };

        inverseExponential = function (inValue) {
            return Math.pow(inValue, 1 / exponent);
        };
        update = function () {
            var position = inverseExponential((data[controlledValue] - minValue) / (maxValue - minValue));
            if (!invertedView) {
                position = 1 - position;
            }
            valueIndicator.updatePosition(position);
        };

        changeHandler = function (event, touch) {
            var pixelCoordinates, svgSize, factor;
            pixelCoordinates = synth.cursorPosition(event, touch);
            svgSize = synth.sizeInPixels(controller);
            factor = exponential((svgSize.height - pixelCoordinates.y) / svgSize.height);
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
                var change, range, newValue, fromCenter, fromMin;
                event.stopPropagation();
                event.preventDefault();
                range = maxValue - minValue;
                scaledValue = (data[controlledValue] - minValue) / range;
                inverseScaledValue = inverseExponential(scaledValue) + event.detail / -100;
                if (inverseScaledValue < 0) {
                    inverseScaledValue = 0;
                } else if (inverseScaledValue > 1) {
                    inverseScaledValue = 1;
                }
                newValue = minValue + exponential(inverseScaledValue) * range;

                data[controlledValue] = newValue;
                if (typeof callback === "function") {
                    callback(data[controlledValue]);
                }
                update();
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
