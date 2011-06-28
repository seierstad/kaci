var Keyboard = function (parentId, frequencyValue, velocityValue, baseFrequency, startKey, endKey) {
	this.container = document.getElementById(parentId);
	this.controlledFrequency = frequencyValue;
	this.controlledVelocity = velocityValue;
	this.baseFrequency = baseFrequency;
	this.keys = [];
	this.keysPressed = [];
    this.keyCodes = [109,65,90,82,88,67,84,86,68,66,72,75,77,69,188,73,190,191,222,81,50,87,51,70,80,53,71,54,74,76,56,85,57,89,48,59,219]; // 
    this.keyMapping = [];
	this.update = function(){};
	var keyboard = document.createElementNS(svgns, "svg");

	keyboard.setAttribute("version", "1.2");
	keyboard.setAttribute("id", "keyboard");
	keyboard.setAttribute("width", "100%");
	keyboard.setAttribute("height", "180px");
	keyboard.setAttribute("baseProfile", "tiny");
	keyboardTouchArea = document.createElementNS(svgns, "rect");
	keyboardTouchArea.setAttribute("x", "0");
	keyboardTouchArea.setAttribute("y", "0");
	keyboardTouchArea.setAttribute("width", "100%");
	keyboardTouchArea.setAttribute("height", "100%");
	keyboardTouchArea.setAttribute("opacity", "0");
	keyboard.appendChild(keyboardTouchArea);
	this.container.appendChild(keyboard);
	
	var noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

	var nextKeyX = 0;
	
	var keyWidth = 100 / ((endKey - startKey) - (((endKey - startKey) / 12) * 5));
	var whiteKeys = document.createElementNS(svgns, "g");
	var blackKeys = document.createElementNS(svgns, "g");

	whiteKeys.setAttribute("class", "white");
	blackKeys.setAttribute("class", "black");	

	for (var i = startKey; i < endKey; i++) {
		var key = document.createElementNS(svgns, "rect");		
		key.setAttribute("class", "key " + noteNames[i % 12]);
		key.setAttribute("y", "0");
		var k = i % 12;
		var blackKey = (k === 1 || k === 3 || k === 6 || k === 8 || k === 10);
		var freq = this.baseFrequency * Math.pow(2, i / 12);
		if (blackKey) {
			key.setAttribute("x", (nextKeyX - keyWidth * 0.35) + "%");
			key.setAttribute("width", (keyWidth * 0.7) + "%");
			key.setAttribute("height", "60%");
			blackKeys.appendChild(key);
		} else {
			key.setAttribute("x", nextKeyX + "%");
			key.setAttribute("width", keyWidth + "%");
			key.setAttribute("height", "100%");
			nextKeyX += keyWidth;
			whiteKeys.appendChild(key);
		}
		this.keys.push({'key': key, 'frequency': freq});
		if (i < this.keyCodes.length) {
		    var keyCode = this.keyCodes[i];
    		this.keyMapping[keyCode] = this.keys[this.keys.length-1];
    	}
	}
	keyboard.appendChild(whiteKeys);
	keyboard.appendChild(blackKeys);
	
	var keyUp = function(event) {
 	    var keyReleased;
 	    if(event.type === 'keyup') {
 	        if (!!this.keyMapping[event.keyCode]) {
 	            keyReleased = this.keyMapping[event.keyCode];
 	        } else {
     	        console.log(event.keyCode);
 	            return true;
 	        }
 	    } else if (event.type === 'mouseup' || event.type === 'mouseout') {
		    for (var i = 0; i < this.keys.length; i++) {
			    if (this.keys[i].key === event.target) {
			        keyReleased = this.keys[i];
				    break;
			    }
		    }
        }
        if (!!keyReleased) {
            var originalClass = keyReleased.key.getAttribute("class");
            keyReleased.key.setAttribute("class", originalClass.replace(' pressed', '', 'g'));
        }
		event.stopPropagation();
		event.preventDefault();
		this.controlledFrequency.setValue(0);
	}.bind(this);
 	var keyDown = function(event) {
 	    var keyPressed;
 	    if(event.type === 'keydown') {
 	        if (!!this.keyMapping[event.keyCode]) {
 	            keyPressed = this.keyMapping[event.keyCode];
 	        } else {
     	        console.log(event.keyCode);
 	            return true;
 	        }
 	    } else if (event.type === 'mousedown') {
		    for (var i = 0; i < this.keys.length; i++) {
			    if (this.keys[i].key === event.target) {
			        keyPressed = this.keys[i];
				    break;
			    }
		    }
        }
        if (!!keyPressed) {
            this.controlledFrequency.setValue(keyPressed.frequency);
            var originalClass = keyPressed.key.getAttribute("class");
            keyPressed.key.setAttribute("class", originalClass + ' pressed');
        }
		event.stopPropagation();
		event.preventDefault();
	}.bind(this);
    document.addEventListener('keydown', keyDown, false);	
	keyboard.addEventListener('mousedown', keyDown, false);
	keyboard.addEventListener('mouseup', keyUp, false);
	keyboard.addEventListener('mouseout', keyUp, false);
    document.addEventListener('keyup', keyUp, false);	
    
	this.controlledFrequency.addController(this);
	
};
var keyboard = new Keyboard('container', frequency, null, 55, 0, 36);

