var kaci = kaci || {};

(function(synth){
    var cursorPosition, sizeInPixels;
    
    cursorPosition = function (event, touch) {
        var x, y, offsetAnchestor, p;
        
        p = touch || event;

        if (p.pageX && p.pageY) {
	        x = p.pageX;
	        y = p.pageY;
        } else {
	        x = p.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
	        y = p.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        offsetAnchestor = event.currentTarget.parentNode;

        while(offsetAnchestor) {
            x -= offsetAnchestor.offsetLeft;
            y -= offsetAnchestor.offsetTop;
            offsetAnchestor = offsetAnchestor.offsetParent;
        }
        return {'x': x, 'y': y};
    };
    
    sizeInPixels = function (svgElement) {
        var unit, height, width;
        unit = svgElement.height.baseVal.SVG_LENGTHTYPE_PX;
        svgElement.height.baseVal.convertToSpecifiedUnits(unit);
        svgElement.width.baseVal.convertToSpecifiedUnits(unit);
        height = svgElement.height.baseVal.valueInSpecifiedUnits;
        width = svgElement.width.baseVal.valueInSpecifiedUnits;
        return {'width': width, 'height': height};
    };
    
    synth.cursorPosition = cursorPosition;
    synth.sizeInPixels = sizeInPixels;
    
    return synth;
})(kaci);
