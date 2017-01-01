/*globals kaci */
import PubSub from "pubsub";

(function (synth) {
    const ribbonController = function (params) {
        let callback = params.callback,
            changeEvent = params.changeEvent || "",
            controlledValue = params.controlledValue,
            currentValue,
            data = params.dataObject,
            draggable = false,
            exponent = params.exponent || 1, // linear default
            maxValue = params.maxValue || 1,
            minValue = params.minValue || 0,
            pointRadius = "10px",
            scrollable = false,
            svgns = "http://www.w3.org/2000/svg",
            touched = false,
            updateEvent = params.updateEvent || "",
            updateIndicatorPosition;

        const range = maxValue - minValue;
        const invertedView = !!(params.invertedView);
        params.width = params.width || "50px";
        params.height = params.height || "300px";
        const controller = synth.svgControllerElement(params);
        const valueIndicator = params.valueIndicator || (function () {
            const element = synth.svg("circle", {cx: "50%", r: pointRadius, fill: "#336699"});
            element.updatePosition = function (position) {
                element.setAttribute("cy", position * 100 + "%");
            };
            return element;
        })();

        const exponential = function (inValue) {
            return Math.pow(inValue, exponent);
        };

        const inverseExponential = function (inValue) {
            return Math.pow(inValue, 1 / exponent);
        };
        const update = function (event, eventData) {
            let updateValue;
            if (event) {
                currentValue = eventData.value;
                updateValue = eventData.value;
            } else if (data) {
                currentValue = data[controlledValue];
                updateValue = data[controlledValue];
            } else {
                console.log("ribbon.update() called without event data / bound data object");
            }
            let position = inverseExponential((updateValue - minValue) / range);
            if (!invertedView) {
                position = 1 - position;
            }
            valueIndicator.updatePosition(position);
            console.log("updated " + event + " with value: " + updateValue);
        };

        const changeHandler = function (event, touch) {
            const pixelCoordinates = synth.cursorPosition(event, touch);
            const svgSize = synth.sizeInPixels(controller);
            const factor = exponential((svgSize.height - pixelCoordinates.y) / svgSize.height);
            const newValue = minValue + (range * factor);

            if (!!data && !!controlledValue) {
                data[controlledValue] = newValue;

                if (typeof callback === "function") {
                    callback(data[controlledValue]);
                }
                update();

            } else if (changeEvent && PubSub) {
                PubSub.publish(changeEvent, {value: newValue});
            }
            return false;
        };

        const mouseDownHandler = function (event) {
            draggable = true;
            changeHandler(event);
        };

        const mouseUpHandler = function () {
            draggable = false;
        };

        const mouseMoveHandler = function (event) {
            if (draggable === true) {
                changeHandler(event);
            }
        };

        const scrollHandler = function (event) {
            if (scrollable) {

                event.stopPropagation();
                event.preventDefault();
                const scaledValue = (currentValue - minValue) / range;
                let inverseScaledValue = inverseExponential(scaledValue) + event.detail / -100;
                if (inverseScaledValue < 0) {
                    inverseScaledValue = 0;
                } else if (inverseScaledValue > 1) {
                    inverseScaledValue = 1;
                }
                const newValue = minValue + exponential(inverseScaledValue) * range;
                if (data) {
                    data[controlledValue] = newValue;
                    if (typeof callback === "function") {
                        callback(data[controlledValue]);
                    }
                    update();
                }
                PubSub.publish("control.change.lfo1.frequency", {value: newValue});
            }
        };
        const mouseOverHandler = function (event) {
            event.preventDefault();
            event.stopPropagation();
            scrollable = true;
        };

        const mouseOutHandler = function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.target.nodeName === "svg" || event.target.nodeName === "rect") {
                draggable = false;
                scrollable = false;
            }
        };

        const touchStartHandler = function (event) {
            touched = true;
            changeHandler(event, event.changedTouches[0]);
            return false;
        };
        const touchLeaveHandler = function () {
            touched = false;
            return false;
        };
        const touchMoveHandler = function (event) {
            if (touched) {
                event.preventDefault();
                event.stopPropagation();
                const position = synth.cursorPosition(event, event.changedTouches[0]);
                const size = synth.sizeInPixels(controller);

                if (position.x < 0 || position.y < 0 || position.x >= size.width || position.y >= size.height) {
                    return touchLeaveHandler(event);
                }

                changeHandler(event, event.changedTouches[0]);
            }
            return false;
        };

        const touchEndHandler = function () {
            touched = false;
            return false;
        };


        update();
        controller.appendChild(valueIndicator);

        controller.addEventListener("touchstart", touchStartHandler, false);
        controller.addEventListener("touchmove", touchMoveHandler, false);
        controller.addEventListener("touchend", touchEndHandler, false);
        controller.addEventListener("touchcancel", touchEndHandler, false);
        controller.addEventListener("touchleave", touchLeaveHandler, false);


        controller.addEventListener("mousedown", mouseDownHandler, false);
        controller.addEventListener("mouseup", mouseUpHandler, false);
        controller.addEventListener("mouseover", mouseOverHandler, false);
        controller.addEventListener("mouseout", mouseOutHandler, false);
        controller.addEventListener("mousemove", mouseMoveHandler, false);

        window.addEventListener("DOMMouseScroll", scrollHandler, false);
        window.addEventListener("mousewheel", scrollHandler, false);
        if (updateEvent) {
            PubSub.subscribe(updateEvent, update);
        }
        return {
            update: update
        };
    };
    synth.ribbon = ribbonController;
    return synth;
})(kaci);
