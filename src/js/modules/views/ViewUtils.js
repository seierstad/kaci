import {SVGNS} from "../constants";

export const svg = function (elementType, attributes) {
    const element = document.createElementNS(SVGNS, elementType);

    for (let attribute in attributes) {
        if (attributes.hasOwnProperty(attribute)) {
            element.setAttributeNS(null, attribute, attributes[attribute]);
        }
    }
    return element;
};

export const getOffsetElement = function (svgElement) {
    // returns the fillRect rectangle.
    let offsetElement = svgElement;

    while (offsetElement && offsetElement.tagName !== "svg" && !offsetElement.classList.contains("controller")) {
        offsetElement = offsetElement.parentNode;
    }
    return offsetElement.firstChild;
};

export const cursorPosition = function (event, touch) {
    let p = touch || event,
        x,
        y;

    if (p.pageX && p.pageY) {
        x = p.pageX;
        y = p.pageY;
    } else {
        x = p.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = p.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    if (event.currentTarget.getBoundingClientRect) {

        const bcr = getOffsetElement(event.currentTarget).getBoundingClientRect();
        x -= bcr.left + (document.body.scrollLeft + document.documentElement.scrollLeft);
        y -= bcr.top + (document.body.scrollTop + document.documentElement.scrollTop);

    } else {
        let offsetElement = event.currentTarget.parentNode;
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

export const sizeInPixels = function (svgElement) {
    const e = getOffsetElement(svgElement);
    const unit = e.height.baseVal.SVG_LENGTHTYPE_PX;
    e.height.baseVal.convertToSpecifiedUnits(unit);
    e.width.baseVal.convertToSpecifiedUnits(unit);
    const height = e.height.baseVal.valueInSpecifiedUnits;
    const width = e.width.baseVal.valueInSpecifiedUnits;

    return {
        "width": width,
        "height": height
    };
};

let rangeInputId = 0;
export const createRangeInput = function (params) {
    const elementId = "range_" + rangeInputId;
    rangeInputId += 1;

    const element = document.createElement("input");
    element.setAttribute("type", "range");
    element.min = params.min;
    element.max = params.max;
    element.step = params.step;
    element.value = params.value;
    element.setAttribute("id", elementId);

    const label = document.createElement("label");
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
export const getCheckboxInputHandler = function (eventName, eventContext) {
    return function (event) {
        event.stopPropagation();
        eventContext.dispatchEvent(new CustomEvent(eventName, {
            "detail": (event.target.checked)
        }));
    };
};

let checkboxInputId = 0;
export const createCheckboxInput = function (params, eventContext) {
    const id = params.id || "checkbox_" + (checkboxInputId += 1);

    const cb = document.createElement("input");
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

export const getValuePair = (evt, element) => {
    const pos = element.getBoundingClientRect();
    const x = (evt.clientX - pos.left) / pos.width;
    const y = 1 - (evt.clientY - pos.top) / pos.height;
    return {
        x, y
    };
};
