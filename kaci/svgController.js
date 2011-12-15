var kaci = kaci || {};

// add base svg constructor
(function(synth){
    var svgControllerElement = function (params) {

        var params = params || {},
            container = params.container,
            wrapper,
            svgElement,
            fillRect,
            group,
            className,
            xlinkns = 'http://www.w3.org/1999/xlink',
            svgns = 'http://www.w3.org/2000/svg';
            
        className = (params.className) ? params.className + ' controller' : 'controller';

	    svgElement = document.createElementNS(svgns, "svg");
	    svgElement.setAttribute("xmlns:xlink", xlinkns);
	    svgElement.setAttribute("version", "1.2");
		svgElement.setAttribute("x", params.offsetX || 0);
		svgElement.setAttribute("y", params.offsetY || 0);
	    svgElement.setAttribute("width", params.width || 500);
	    svgElement.setAttribute("height", params.height || 500);
		svgElement.setAttribute("class", className);

		fillRect = document.createElementNS(svgns, "rect");
		fillRect.setAttribute("width", "100%");
		fillRect.setAttribute("height", "100%");
		fillRect.setAttribute("opacity", "0");

		svgElement.appendChild(fillRect);

		if (container && container.tagName === "svg") {
			container.appendChild(svgElement);
		} else {
		    wrapper = params.wrapper || document.createElement("div");
		    wrapper.setAttribute("class", className);
		    wrapper.appendChild(svgElement);

		    if (params.parentId) {
		    	container = document.getElementById(params.parentId);
		    	container.appendChild(wrapper);
		    } else {
		        document.appendChild(wrapper);
		    }
        }
        return svgElement;
    };
    synth.svgControllerElement = svgControllerElement;
    return synth;
})(kaci);
