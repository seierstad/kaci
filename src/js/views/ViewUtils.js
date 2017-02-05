import {SVGNS} from "../constants";

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


export const getValuePair = (evt, element) => {
    const pos = element.getBoundingClientRect();
    const x = (evt.clientX - pos.left) / pos.width;
    const y = 1 - (evt.clientY - pos.top) / pos.height;
    return {
        x, y
    };
};
