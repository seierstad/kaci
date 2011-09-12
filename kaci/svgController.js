var kaci = kaci || {};

// add base svg constructor
(function(synth){
    var svgControllerElement = function (params) {

        var params = params || {},
            svgElement, container, wrapper, fillRect,
            // xlinkns = 'http://www.w3.org/1999/xlink',
            svgns = 'http://www.w3.org/2000/svg';
        wrapper = document.createElement("div");
        wrapper.setAttribute("class", "controller");
        svgElement = document.createElementNS(svgns, "svg");
        svgElement.setAttribute("version", "1.2");
        svgElement.setAttribute("width", params.width || 500);
        svgElement.setAttribute("height", params.height || 500);
	    fillRect = document.createElementNS(svgns, "rect");
	    fillRect.setAttribute("x", "0");
	    fillRect.setAttribute("y", "0");
	    fillRect.setAttribute("width", "100%");
	    fillRect.setAttribute("height", "100%");
	    fillRect.setAttribute("opacity", "0");
	    svgElement.appendChild(fillRect);        
        wrapper.appendChild(svgElement);
        if (params.parentId) {
        	container = document.getElementById(params.parentId);
        	container.appendChild(wrapper);
        } else {
            document.appendChild(wrapper);
        }
        return svgElement;
    };
    synth.svgControllerElement = svgControllerElement;
    return synth;
})(kaci);
