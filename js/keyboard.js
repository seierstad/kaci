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
                //                colemak: [109, 65, 90, 82, 88, 67, 84, 86, 68, 66, 72, 75, 77, 69, 188, 73, 190, 191, 222, 81, 50, 87, 51, 70, 80, 53, 71, 54, 74, 76, 56, 85, 57, 89, 48, 59, 219],
                colemak: [189, 65, 90, 82, 88, 67, 84, 86, 68, 66, 72, 75, 77, 69, 188, 73, 190, 191, 222, 81, 50, 87, 51, 70, 80, 53, 71, 54, 74, 76, 56, 85, 57, 89, 48, 186, 219],

                qwerty: [90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188, 76, 190]
            },
            noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'],

            svgns = 'http://www.w3.org/2000/svg',
            init,
            keyDown,
            keyUp,
            keyDownEventId = 0,
            keyUpEventId = 0,
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
                keys.push({
                    'DOMElement': key,
                    'frequency': freq
                });
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
                    if (keys[i].DOMElement === event.target) {
                        keyPressed = keys[i];
                        break;
                    }
                }
                break;
            case 'touchstart':
                for (i = 0; i < keys.length; i += 1) {
                    if (keys[i].DOMElement === event.target) {
                        keyPressed = keys[i];
                        break;
                    }
                }
                break;
            }
            if (!!keyPressed && !keyPressed.keyDownSent && !keyPressed.voiceId) {

                keyDownEventId += 1;
                keyPressed.keyDownSent = true;
                keyPressed.keyDownEventId = keyDownEventId;

                PubSub.publish('control.change.keyboard.keyDown', {
                    frequency: keyPressed.frequency,
                    eventId: keyDownEventId
                });
            }
            return false;
        };

        keyUp = function keyUp(event) {
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
                    if (keys[i].DOMElement === event.target) {
                        keyReleased = keys[i];
                        break;
                    }
                }
                break;
            }
            if (!!keyReleased && keyReleased.voiceId) {

                keyUpEventId += 1;
                keyReleased.keyUpSent = true;
                keyReleased.keyUpEventId = keyUpEventId;

                PubSub.publish('control.change.keyboard.keyUp', {
                    frequency: keyReleased.frequency,
                    eventId: keyUpEventId,
                    voiceId: keyReleased.voiceId
                });
            }
        };

        var voiceStartedHandler = function (event, data) {
            var i, j, key;
            if (data.causedBy === 'control.change.keyboard.keyDown') {
                for (i = 0, j = keys.length; i < j; i += 1) {
                    key = keys[i];
                    if (key.keyDownSent && key.keyDownEventId === data.causedById) {
                        originalClass = key.DOMElement.getAttribute("class");
                        key.DOMElement.setAttribute("class", originalClass + ' pressed');
                        key.voiceId = data.voiceId;
                        delete key.keyDownSent;
                        delete key.keyDownEventId;
                    }
                }
            }
        };
        var voiceEndedHandler = function (event, data) {
            var i, j, key, originalClass;
            for (i = 0, j = keys.length; i < j; i += 1) {
                key = keys[i];
                if (data.causedBy === 'control.change.keyboard.keyUp') {

                    if (key.keyUpSent && key.voiceId === data.voiceId) {
                        originalClass = key.DOMElement.getAttribute("class");
                        key.DOMElement.setAttribute("class", originalClass.replace(' pressed', '', 'g').replace(' dropped', '', 'g'));
                        delete key.voiceId;
                        break;
                    }
                } else if (event === 'voice.dropped') {
                    if (key.voiceId === data.voiceId) {
                        originalClass = key.DOMElement.getAttribute("class");
                        key.DOMElement.setAttribute("class", originalClass + ' dropped');
                    }
                }
            }
        };
        init();
        keyboard.addEventListener('mousedown', keyDown, false);
        keyboard.addEventListener('mouseup', keyUp, false);
        keyboard.addEventListener('mouseout', keyUp, false);
        document.addEventListener('touchstart', keyDown, false);
        document.addEventListener('keydown', keyDown, false);
        document.addEventListener('keyup', keyUp, false);
        PubSub.subscribe('voice.started', voiceStartedHandler);
        PubSub.subscribe('voice.ended', voiceEndedHandler);
        PubSub.subscribe('voice.dropped', voiceEndedHandler);
        return keyboard;
    }

    synth.keyboardController = keyboardController;
    return synth;
})(kaci);
