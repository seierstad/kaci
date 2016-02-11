/*globals require, module */
"use strict";
var SVGControllerElement = require('./SVGControllerElement');
var Utils = require('./ViewUtils');

var KeyboardView = function (context, params) {
    if (!params) {
        params = {};
    }
    var data = params.dataObject,
        view,
        keyboard,
        keys = [],
        noteNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'],

        init,
        keyUpHandler,
        keyDownHandler,
        startKey = params.startKey || 0,
        endKey = params.endKey || 13,
        pitchShift,
        chordShift;

    this.id = params.id || 'keyboard';

    view = document.createElement('section');
    view.id = this.id + '-view';

    keyboard = new SVGControllerElement(params);

    view.appendChild(keyboard);
    params.width = params.width || '100%';
    params.height = params.height || '180px';


    pitchShift = Utils.createRangeInput({
        label: "Pitch shift",
        container: view,
        min: -1,
        max: 1,
        step: 0.01,
        value: 0
    });
    pitchShift.input.addEventListener('input', function (evt) {
        var event = new CustomEvent("keyboard.pitchShift", {
            detail: {
                value: evt.target.value
            }
        });
        context.dispatchEvent(event);
    });
    view.appendChild(pitchShift.label);
    view.appendChild(pitchShift.input);


    chordShift = Utils.createRangeInput({
        label: "Chord shift",
        container: view,
        min: 0,
        max: 1,
        step: 0.01,
        value: 0
    });
    chordShift.input.addEventListener('input', function (evt) {
        var event = new CustomEvent("chordShift.change", {
            detail: {
                value: evt.target.value
            }
        });
        context.dispatchEvent(event);
    });
    view.appendChild(chordShift.label);
    view.appendChild(chordShift.input);

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
            keys[i] = {
                'DOMElement': key
            };
        }
        keyboard.appendChild(whiteKeys);
        keyboard.appendChild(blackKeys);

    };

    keyDownHandler = function (event) {
        var keyPressed,
            originalClass,
            i;

        var isPressed = function (key, index) {
            if (key.DOMElement === event.target && !key.pressed) {
                keyPressed = index;
                key.pressed = true;
            }
        };


        switch (event.type) {
        case 'mousedown':
        case 'touchstart':
            keys.forEach(isPressed);
            break;
        }
        if (keyPressed) {
            context.dispatchEvent(new CustomEvent('keyboard.keydown', {
                'detail': {
                    'keyNumber': keyPressed,
                    'source': 'keyboardView'
                }
            }));
        }
        return false;
    };

    keyUpHandler = function keyUp(event) {
        var keyReleased,
            number;

        var isReleased = function (key, index) {
            if (key.DOMElement === event.target) {
                if (key.pressed) {
                    keyReleased = key;
                    key.pressed = false;
                    number = index;
                }
            }
        };

        switch (event.type) {
        case 'mouseup':
        case 'mouseout':
            keys.forEach(isReleased);
            break;
        }
        if (keyReleased) {
            context.dispatchEvent(new CustomEvent('keyboard.keyup', {
                'detail': {
                    'keyNumber': number,
                    'source': 'keyboardView'
                }
            }));
        }
    };

    var voiceStartedHandler = function (event) {
        keys.forEach(function (key, index) {
            if (index === event.detail.keyNumber) {
                key.DOMElement.classList.remove('dropped');
                key.DOMElement.classList.add('pressed');
            }
        });
    };
    var voiceEndedHandler = function (event) {
        keys.forEach(function (key, index) {
            if (index === event.detail.keyNumber) {
                key.DOMElement.classList.remove('pressed');
            }
        });
    };
    var voiceDroppedHandler = function (event) {
        keys.forEach(function (key, index) {
            if (index === event.detail.keyNumber) {
                key.DOMElement.classList.remove('pressed');
                key.DOMElement.classList.add('dropped');
            }
        });
    };

    var pitchBendHandler = function pitchBendHandler(event) {
        pitchShift.input.value = event.detail.value;
    };

    var chordShiftChangedHandler = function (event) {
        var i,
            j,
            pair;

        for (i = 0, j = event.detail.keys.length; i < j; i += 1) {
            pair = event.detail.keys[i];
            console.log(keys[pair.from] + " til " + keys[pair.to]);
        }
    };

    init();

    keyboard.addEventListener('mousedown', keyDownHandler, false);
    keyboard.addEventListener('mouseup', keyUpHandler, false);
    keyboard.addEventListener('mouseout', keyUpHandler, false);
    document.addEventListener('touchstart', keyDownHandler, false);
    context.addEventListener('voice.started', voiceStartedHandler); // new voice started
    context.addEventListener('voice.ended', voiceEndedHandler); // voice finished
    context.addEventListener("chordShift.changed", chordShiftChangedHandler, false);
    context.addEventListener("pitchBend.change", pitchBendHandler, false);

    return view;
};

module.exports = KeyboardView;