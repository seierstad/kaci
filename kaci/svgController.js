var kaci = kaci || {};

// add base svg constructor
(function(synth){
    var svgControllerElement = function (params) {

        var params = params || {},
            wrapper,
            svgElement = params.svgElement,
            svgElement2,
            container,
            fillRect,
            group,
            className,
            // xlinkns = 'http://www.w3.org/1999/xlink',
            svgns = 'http://www.w3.org/2000/svg';
            
	    svgElement2 = document.createElementNS(svgns, "svg");
	    svgElement2.setAttribute("version", "1.2");
		svgElement2.setAttribute("x", "50%");
		svgElement2.setAttribute("y", "0");
	    svgElement2.setAttribute("width", "50%");
	    svgElement2.setAttribute("height", params.height || 500);

        className = (params.className) ? params.className + ' controller' : 'controller';
		fillRect = document.createElementNS(svgns, "rect");
		fillRect.setAttribute("width", "100%");
		fillRect.setAttribute("height", "100%");
		fillRect.setAttribute("opacity", "0");
		
		group = document.createElementNS(svgns, "g");
		group.setAttribute("class", className);
		group.appendChild(fillRect);
		svgElement2.appendChild(group);

		if (svgElement) {
			svgElement.appendChild(svgElement2);
			return group;
		} else {
		
		    wrapper = params.wrapper || document.createElement("div");
		    wrapper.setAttribute("class", className);
		    
		    svgElement = document.createElementNS(svgns, "svg");
		    svgElement.setAttribute("version", "1.2");
			svgElement.setAttribute("x", "0");
			svgElement.setAttribute("y", "0");
		    svgElement.setAttribute("width", params.width || 500);
		    svgElement.setAttribute("height", params.height || 500);

			svgElement.appendChild(svgElement2);
		    wrapper.appendChild(svgElement);

		    if (params.parentId) {
		    	container = document.getElementById(params.parentId);
		    	container.appendChild(wrapper);
		    } else {
		        document.appendChild(wrapper);
		    }
        }
        return group;
    };
    synth.svgControllerElement = svgControllerElement;
    return synth;
})(kaci);
