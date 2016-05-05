/*global module */
const SVGControllerElement = function (params) {
    "use strict";

    let className,
        container = params.container,
        fillRect,
        svgElement,
        svgns = "http://www.w3.org/2000/svg",
        xlinkns = "http://www.w3.org/1999/xlink";

    className = (params.className) ? params.className + " controller" : "controller";

    svgElement = document.createElementNS(svgns, "svg");
    svgElement.setAttribute("xmlns:xlink", xlinkns);
    svgElement.setAttribute("xmlns", svgns);
    svgElement.setAttributeNS(null, "version", "1.2");
    svgElement.setAttributeNS(null, "x", params.offsetX || 0);
    svgElement.setAttributeNS(null, "y", params.offsetY || 0);
    if (params.width) {
        svgElement.setAttributeNS(null, "width", params.width || 500);
    }
    if (params.height) {
        svgElement.setAttributeNS(null, "height", params.height || 500);
    }
    svgElement.setAttributeNS(null, "class", className);

    fillRect = document.createElementNS(svgns, "rect");
    fillRect.setAttributeNS(null, "width", "100%");
    fillRect.setAttributeNS(null, "height", "100%");
    fillRect.setAttributeNS(null, "opacity", "0");

    svgElement.appendChild(fillRect);

    if (container && container.tagName === "svg") {
        container.appendChild(svgElement);
    }
    /*
       else {
           wrapper = params.wrapper || document.createElement("div");
           wrapper.setAttributeNS(null, "class", className);
           wrapper.appendChild(svgElement);

           if (params.parent) {
               if (params.parent.nodeType === 1) {
                   params.parent.appendChild(wrapper);
               } else {
                   container = document.getElementById(params.parent);
                   container.appendChild(wrapper);
               }
           } else {
               document.body.appendChild(wrapper);
           }
       } */
    return svgElement;
};
module.exports = SVGControllerElement;