var kaci = kaci || {};
(function (synth) {
    var keyboardController;
    keyboardController = function (params) {
        var params = params || {},
            data = params.dataObject,
            keyboard,
            baseFrequency = params.baseFrequency || 110,
            keys = [],
            keyMapping = [],
            keysPressed = [],
            keyboardCodeLayouts = {
                colemak: [109, 65, 90, 82, 88, 67, 84, 86, 68, 66, 72, 75, 77, 69, 188, 73, 190, 191, 222, 81, 50, 87, 51, 70, 80, 53, 71, 54, 74, 76, 56, 85, 57, 89, 48, 59, 219],
                qwerty: [90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188, 76, 190]
            },
            noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'],

            svgns = 'http://www.w3.org/2000/svg',
            init,
            keyDown,
            keyUp,
            startKey = params.startKey || 0,
            endKey = params.endKey || 13,
            keyCodes = keyboardCodeLayouts.colemak;

        keyboard = synth.svgControllerElement(params);
        params.width = params.width || '100%';
        params.height = params.height || '180px';

        init = function () {
            var nextKeyX = 0,
                keyWidth = 100 / ((endKey - startKey) - (((endKey - startKey) / 12) * 5)),
                whiteKeys = document.createElementNS(svgns, "g"),
                blackKeys = document.createElementNS(svgns, "g"),
                i,
                k,
                key,
                blackKey,
                freq;

            whiteKeys.setAttribute("class", "white");
            blackKeys.setAttribute("class", "black");

            for (i = startKey; i < endKey; i += 1) {
                key = document.createElementNS(svgns, "rect");
                key.setAttribute("class", "key " + noteNames[i % 12]);
                key.setAttribute("y", "0");
                k = i % 12;
                blackKey = (k === 1 || k === 3 || k === 6 || k === 8 || k === 10);
                freq = baseFrequency * Math.pow(2, i / 12);
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
                keys.push({'key': key, 'frequency': freq});
                if (i < keyCodes.length) {
                    keyMapping[keyCodes[i]] = keys[keys.length - 1];
                }
            }
            keyboard.appendChild(whiteKeys);
            keyboard.appendChild(blackKeys);
        };
        keyDown = function (event) {
            var keyPressed, 
                originalClass, 
                i;

            switch (event.type) {
                case 'keydown':
                    if (!!keyMapping[event.keyCode]) {
                        if (!keyMapping[event.keyCode].voice) {
                            keyPressed = keyMapping[event.keyCode];
                        }
                    } else {
                        return true;
                    }
                    break;
                case 'mousedown':
                    for (i = 0; i < keys.length; i += 1) {
                        if (keys[i].key === event.target) {
                            keyPressed = keys[i];
                            break;
                        }
                    }
                    break;
                case 'touchstart':
                    for (i = 0; i < keys.length; i += 1) {
                        if (keys[i].key === event.target) {
                            keyPressed = keys[i];
                            break;
                        }
                    }
                    break;
            }
            if (!!keyPressed) {
                keyPressed.voice = synth.startVoice(keyPressed.frequency);
                originalClass = keyPressed.key.getAttribute("class");
                keyPressed.key.setAttribute("class", originalClass + ' pressed');
            }
            return false;
        };

        keyUp = function (event) {
            var keyReleased, 
                originalClass, 
                i;

            switch (event.type) {
                case 'keyup':
                    if (!!keyMapping[event.keyCode]) {
                        keyReleased = keyMapping[event.keyCode];
                    } else {
                        return true;
                    }
                    break;
                case 'mouseup':
                case 'mouseout':
                    for (i = 0; i < keys.length; i += 1) {
                        if (keys[i].key === event.target) {
                            keyReleased = keys[i];
                            break;
                        }
                    }
                    break;
            }
            if (!!keyReleased) {
                if (keyReleased.voice) {
                    keyReleased.voice.end();
                    delete keyReleased.voice;
                }
                originalClass = keyReleased.key.getAttribute("class");
                keyReleased.key.setAttribute("class", originalClass.replace(' pressed', '', 'g'));
            }
        };

        init();
        keyboard.addEventListener('mousedown', keyDown, false);
        keyboard.addEventListener('mouseup', keyUp, false);
        keyboard.addEventListener('mouseout', keyUp, false);
        document.addEventListener('touchstart', keyDown, false);
        document.addEventListener('keydown', keyDown, false);
        document.addEventListener('keyup', keyUp, false);
        return keyboard;
    }

    synth.keyboardController = keyboardController;
    return synth;
})(kaci);

