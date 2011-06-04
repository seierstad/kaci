var Keyboard = function (parentId, frequencyValue, velocityValue, baseFrequency, startKey, endKey) {
	this.container = document.getElementById(parentId);
	this.controlledFrequency = frequencyValue;
	this.controlledVelocity = velocityValue;
	this.baseFrequency = baseFrequency;
	this.keys = [];
	this.keysPressed = [];
	this.update = function(){};
	var keyboard = document.createElementNS(svgns, "svg");

	keyboard.setAttribute("version", "1.2");
	keyboard.setAttribute("id", "keyboard");
	keyboard.setAttribute("width", "700px");
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
	
	var keyWidth = 100 / (endKey - startKey);
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
	}
	keyboard.appendChild(whiteKeys);
	keyboard.appendChild(blackKeys);
	
	var keyUp = function(event) {
		event.stopPropagation();
		event.preventDefault();
		this.controlledFrequency.setValue(0);
		event.target.addEventListener('mousedown', keyDown, false);
		event.target.removeEventListener('mouseup', keyUp, false);
		event.target.removeEventListener('mouseout', keyUp, false);
	}.bind(this);
 	var keyDown = function(event) {
		event.stopPropagation();
		event.preventDefault();
		for (var i = 0; i < this.keys.length; i++) {
			if (this.keys[i].key === event.target) {
				this.controlledFrequency.setValue(this.keys[i].frequency);
				break;
			}
		}
		
		event.target.addEventListener('mouseup', keyUp, false);
		event.target.addEventListener('mouseout', keyUp, false);
		event.target.removeEventListener('mousedown', keyDown, false);
	}.bind(this);
	
	keyboard.addEventListener('mousedown', keyDown, false);
	this.controlledFrequency.addController(this);
	
};
var keyboard = new Keyboard('container', frequency, null, 110, 0, 24);

