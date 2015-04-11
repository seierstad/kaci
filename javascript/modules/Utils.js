/*global module, require */
/* global document, module, CustomEvent */
"use strict";
var svg = function (elementType, attributes) {
    var element,
        svgns = "http://www.w3.org/2000/svg",
        attribute;

    element = document.createElementNS(svgns, elementType);
    for (attribute in attributes) {
        if (attributes.hasOwnProperty(attribute)) {
            element.setAttributeNS(null, attribute, attributes[attribute]);
        }
    }
    return element;
};

var getOffsetElement = function (svgElement) {
    // returns the fillRect rectangle.
    var offsetElement;

    for (offsetElement = svgElement; offsetElement && offsetElement.tagName !== "svg" && !offsetElement.classList.contains("controller"); offsetElement = offsetElement.parentNode) {}
    return offsetElement.firstChild;
};

var cursorPosition = function (event, touch) {
    var x,
        y,
        offsetElement,
        bcr,
        p;

    p = touch || event;

    if (p.pageX && p.pageY) {
        x = p.pageX;
        y = p.pageY;
    } else {
        x = p.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = p.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    if (event.currentTarget.getBoundingClientRect) {

        bcr = getOffsetElement(event.currentTarget).getBoundingClientRect();
        x -= bcr.left + (document.body.scrollLeft + document.documentElement.scrollLeft);
        y -= bcr.top + (document.body.scrollTop + document.documentElement.scrollTop);

    } else {
        offsetElement = event.currentTarget.parentNode;
        while (offsetElement) {
            x -= offsetElement.offsetLeft;
            y -= offsetElement.offsetTop;
            offsetElement = offsetElement.offsetParent;
        }
    }
    return {
        "x": x,
        "y": y
    };
};

var sizeInPixels = function (svgElement) {
    var unit, height, width, e;
    e = getOffsetElement(svgElement);
    unit = e.height.baseVal.SVG_LENGTHTYPE_PX;
    e.height.baseVal.convertToSpecifiedUnits(unit);
    e.width.baseVal.convertToSpecifiedUnits(unit);
    height = e.height.baseVal.valueInSpecifiedUnits;
    width = e.width.baseVal.valueInSpecifiedUnits;
    return {
        "width": width,
        "height": height
    };
};
var rangeInputId = 0;
var createRangeInput = function (params) {
    var elementId = "range_" + rangeInputId++;
    var element = document.createElement("input");
    element.setAttribute("type", "range");
    element.min = params.min;
    element.max = params.max;
    element.step = params.step;
    element.value = params.value;
    element.setAttribute("id", elementId);
    var label = document.createElement("label");
    label.innerHTML = params.label;
    label.setAttribute("for", elementId);

    if (params && params.container) {
        params.container.appendChild(label);
        params.container.appendChild(element);
    }
    return {
        label: label,
        input: element
    };
};
var getCheckboxInputHandler = function (eventName, eventContext) {
    return function (event) {
        event.stopPropagation();
        eventContext.dispatchEvent(new CustomEvent(eventName, {
            "detail": (event.target.checked)
        }));
    };
};
var checkboxInputId = 0;
var createCheckboxInput = function (params, eventContext) {
    var id = params.id || "checkbox_" + checkboxInputId++;
    var cb = document.createElement("input");
    cb.type = "checkbox";
    if (params.className) {
        cb.classList.add(params.className);
    }
    if (params.checked) {
        cb.checked = true;
    }
    if (eventContext && params.dispatchEvent) {
        cb.addEventListener("change", getCheckboxInputHandler(id + params.dispatchEvent, eventContext));
    }
    return cb;
};

module.exports = {
    "sizeInPixels": sizeInPixels,
    "svg": svg,
    "getOffsetElement": getOffsetElement,
    "cursorPosition": cursorPosition,
    "createRangeInput": createRangeInput,
    "createCheckboxInput": createCheckboxInput
};