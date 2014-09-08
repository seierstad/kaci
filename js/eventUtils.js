var kaci = kaci || {};

(function (synth) {
    var svg, getOffsetElement, cursorPosition, sizeInPixels;

    svg = function (elementType, attributes) {
        var element,
            svgns = 'http://www.w3.org/2000/svg',
            attribute;

        element = document.createElementNS(svgns, elementType);
        for (attribute in attributes) {
            if (attributes.hasOwnProperty(attribute)) {
                element.setAttributeNS(null, attribute, attributes[attribute]);
            }
        }
        return element;
    };

    getOffsetElement = function (svgElement) {
        // returns the fillRect rectangle.
        for (offsetElement = svgElement; offsetElement && offsetElement.tagName !== "svg" && !offsetElement.classList.contains('controller'); offsetElement = offsetElement.parentNode);
        return offsetElement.firstChild;
    };

    cursorPosition = function (event, touch) {
        var x, y, offsetElement, bcr, p;

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
            'x': x,
            'y': y
        };
    };

    sizeInPixels = function (svgElement) {
        var unit, height, width, e;
        e = getOffsetElement(svgElement);
        unit = e.height.baseVal.SVG_LENGTHTYPE_PX;
        e.height.baseVal.convertToSpecifiedUnits(unit);
        e.width.baseVal.convertToSpecifiedUnits(unit);
        height = e.height.baseVal.valueInSpecifiedUnits;
        width = e.width.baseVal.valueInSpecifiedUnits;
        return {
            'width': width,
            'height': height
        };
    };
    synth.svg = svg;
    synth.cursorPosition = cursorPosition;
    synth.sizeInPixels = sizeInPixels;

    return synth;
})(kaci);
