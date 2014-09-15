var kaci = kaci || {};

(function (synth) {
    var ribbonController;
    ribbonController = function (params) {
        var params = params || {},
            data = params.dataObject,
            controlledValue = params.controlledValue,
            minValue = params.minValue || 0,
            maxValue = params.maxValue || 1,
            range,
            callback = params.callback,
            draggable = false,
            scrollable = false,
            touched = false,
            exponent = params.exponent || 1, // linear default
            changeEvent = params.changeEvent || '',
            updateEvent = params.updateEvent || '',
            currentValue,
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

        range = maxValue - minValue;
        invertedView = !!(params.invertedView);
        params.width = params.width || '50px';
        params.height = params.height || '300px';
        controller = synth.svgControllerElement(params);
        valueIndicator = params.valueIndicator || (function () {
            var element = synth.svg("circle", {
                cx: "50%",
                r: pointRadius,
                fill: "#336699"
            });
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
        update = function (event, eventData) {
            var updateValue;
            if (event) {
                currentValue = eventData.value;
                updateValue = eventData.value;
            } else if (data) {
                currentValue = data[controlledValue];
                updateValue = data[controlledValue];
            } else {
                console.log('ribbon.update() called without event data / bound data object');
            }
            var position = inverseExponential((updateValue - minValue) / range);
            if (!invertedView) {
                position = 1 - position;
            }
            valueIndicator.updatePosition(position);
            console.log('updated ' + event + ' with value: ' + updateValue);
        };

        changeHandler = function (event, touch) {
            var pixelCoordinates,
                svgSize,
                factor,
                newValue;

            pixelCoordinates = synth.cursorPosition(event, touch);
            svgSize = synth.sizeInPixels(controller);
            factor = exponential((svgSize.height - pixelCoordinates.y) / svgSize.height);
            newValue = minValue + (range * factor);

            if (!!data && !!controlledValue) {
                data[controlledValue] = newValue;

                if (typeof callback === "function") {
                    callback(data[controlledValue]);
                }
                update();

            } else if (changeEvent && PubSub) {
                PubSub.publish(changeEvent, {
                    value: newValue
                });
            }
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
                var change,
                    scaledValue,
                    newValue,
                    fromCenter,
                    fromMin;

                event.stopPropagation();
                event.preventDefault();
                scaledValue = (currentValue - minValue) / range;
                inverseScaledValue = inverseExponential(scaledValue) + event.detail / -100;
                if (inverseScaledValue < 0) {
                    inverseScaledValue = 0;
                } else if (inverseScaledValue > 1) {
                    inverseScaledValue = 1;
                }
                newValue = minValue + exponential(inverseScaledValue) * range;
                if (data) {
                    data[controlledValue] = newValue;
                    if (typeof callback === "function") {
                        callback(data[controlledValue]);
                    }
                    update();
                }
                PubSub.publish('control.change.lfo1.frequency', {
                    value: newValue
                });
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
        if (updateEvent) {
            PubSub.subscribe(updateEvent, update);
        }
        return {
            update: update
        }
    }
    /*
     
     */
    synth.ribbon = ribbonController;
    return synth;
})(kaci);
