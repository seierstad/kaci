/*globals require, module */
"use strict";
var SVGControllerElement = require('./SVGControllerElement');
var Utils = require('./Utils');

var KeyboardView = function (context, params) {
    var params = params || {},
        data = params.dataObject,
        view,
        keyboard,
        keys = [],
        noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'],

        init,
        keyUpHandler,
        keyDownHandler,
        startKey = params.startKey || 0,
        endKey = params.endKey || 13;

    this.id = params.id || 'keyboard';

    view = document.createElement('section');
    view.id = this.id + '-view';

    keyboard = new SVGControllerElement(params);

    view.appendChild(keyboard);
    params.width = params.width || '100%';
    params.height = params.height || '180px';

    init = function () {

        var nextKeyX = 0,
            keyWidth = 100 / ((endKey - startKey) - (((endKey - startKey) / 12) * 5)),
            whiteKeys = Utils.svg("g"),
            blackKeys = Utils.svg("g"),
            i,
            k,
            key,
            blackKey;

        whiteKeys.setAttribute("class", "white");
        blackKeys.setAttribute("class", "black");

        for (i = startKey; i < endKey; i += 1) {
            k = i % 12;
            blackKey = (k === 1 || k === 3 || k === 6 || k === 8 || k === 10);
            if (blackKey) {
                key = Utils.svg('rect', {
                    "class": "key " + noteNames[i % 12],
                    "y": "0",
                    "x": (nextKeyX - keyWidth * 0.35) + "%",
                    "width": (keyWidth * 0.7) + "%",
                    "height": "60%"
                });
                blackKeys.appendChild(key);
            } else {
                key = Utils.svg('rect', {
                    "class": "key " + noteNames[i % 12],
                    "y": "0",
                    "x": nextKeyX + "%",
                    "width": keyWidth + "%",
                    "height": "100%"
                });

                nextKeyX += keyWidth;
                whiteKeys.appendChild(key);
            }
            keys.push({
                'DOMElement': key,
                'number': i
            });
        }
        keyboard.appendChild(whiteKeys);
        keyboard.appendChild(blackKeys);
    };

    keyDownHandler = function (event) {
        var keyPressed,
            originalClass,
            i;

        switch (event.type) {
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
        if (keyPressed) {
            keyPressed.pressed = true;
            context.dispatchEvent(new CustomEvent('keyboard.keydown', {
                'detail': {
                    'keyNumber': keyPressed.number,
                    'source': 'keyboardView'
                }
            }));
        }
        return false;
    };

    keyUpHandler = function keyUp(event) {
        var keyReleased,
            originalClass,
            i;

        switch (event.type) {
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
        if (keyReleased && keyReleased.pressed) {
            keyReleased.pressed = false;
            context.dispatchEvent(new CustomEvent('keyboard.keyup', {
                'detail': {
                    'keyNumber': keyReleased.number,
                    'source': 'keyboardView'
                }
            }));
        }
    };

    var voiceStartedHandler = function (event) {
        var i, j, key, originalClass;
        for (i = 0, j = keys.length; i < j; i += 1) {
            key = keys[i];
            if (key.number === event.detail.keyNumber) {
                key.DOMElement.classList.remove('dropped');
                key.DOMElement.classList.add('pressed');
            }
        }
    };
    var voiceEndedHandler = function (event) {
        var i, j, key, originalClass;
        for (i = 0, j = keys.length; i < j; i += 1) {
            key = keys[i];
            if (key.number === event.detail.keyNumber) {
                key.DOMElement.classList.remove('pressed');
            }
        }
    };
    var voiceDroppedHandler = function (event) {
        var i, j, key, originalClass;
        for (i = 0, j = keys.length; i < j; i += 1) {
            key = keys[i];
            if (key.number === event.detail.keyNumber) {
                key.DOMElement.classList.remove('pressed');
                key.DOMElement.classList.add('dropped');
            }
        }
    };

    init();

    keyboard.addEventListener('mousedown', keyDownHandler, false);
    keyboard.addEventListener('mouseup', keyUpHandler, false);
    keyboard.addEventListener('mouseout', keyUpHandler, false);
    document.addEventListener('touchstart', keyDownHandler, false);
    context.addEventListener('voice.started', voiceStartedHandler); // new voice started
    context.addEventListener('voice.ended', voiceEndedHandler); // voice finished

    return view;
};

module.exports = KeyboardView;
