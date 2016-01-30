/* global require, document */
"use strict";
var KeyboardInput = function (context, configuration) {
    var keyboardCodeLayouts,
        keyDownHandler,
        keyUpHandler,
        changeLayout,
        changeLayoutHandler,
        activeLayout,
        activeLayoutName,
        pressed;

    keyboardCodeLayouts = {
        // colemak: [109, 65, 90, 82, 88, 67, 84, 86, 68, 66, 72, 75, 77, 69, 188, 73, 190, 191, 222, 81, 50, 87, 51, 70, 80, 53, 71, 54, 74, 76, 56, 85, 57, 89, 48, 59, 219],
        "colemak": {
            "offset": 36,
            "map": [189, 65, 90, 82, 88, 67, 84, 86, 68, 66, 72, 75, 77, 69, 188, 73, 190, 191, 222, 81, 50, 87, 51, 70, 80, 53, 71, 54, 74, 76, 56, 85, 57, 89, 48, 186, 219]
        },
        "qwerty-norwegian": {
            "offset": 36,
            "map": [90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188, 76, 190, 186, 189, 81, 50, 87, 51, 69, 52, 82, 84, 54, 89, 55, 85, 73, 57, 79, 48, 80, 187, 219, 221]
        },
        "qwerty": {
            "offset": 36,
            "map": [192, 65, 90, 83, 88, 67, 70, 86, 71, 66, 72, 78, 77, 75, 188, 76, 190, 191, 222, 81, 50, 87, 51, 69, 82, 53, 84, 54, 89, 85, 56, 73, 57, 79, 48, 80, 219]
        }
    };
    activeLayoutName = "qwerty";
    if (configuration && configuration.layout && keyboardCodeLayouts[configuration.layout]) {
        activeLayoutName = configuration.layout;
    }
    activeLayout = keyboardCodeLayouts[activeLayoutName];
    pressed = [];

    keyDownHandler = function (event) {
        var index,
            key;

        if (event.altKey || event.metaKey || event.shiftKey || event.ctrlKey) {
            return true;
        }
        index = activeLayout.map.indexOf(event.keyCode);
        key = activeLayout.offset + index;

        if (index !== -1 && !pressed[key]) {
            context.dispatchEvent(new CustomEvent('keyboard.keydown', {
                'detail': {
                    'keyNumber': key,
                    'source': 'keyboardInput'
                }
            }));
            event.preventDefault();
            event.stopPropagation();
            pressed[key] = true;
        } else {
            //            console.log(event.keyCode);
        }
    };
    keyUpHandler = function (event) {
        var index,
            key;

        index = activeLayout.map.indexOf(event.keyCode);
        key = activeLayout.offset + index;

        if (index !== -1) {
            context.dispatchEvent(new CustomEvent('keyboard.keyup', {
                'detail': {
                    'keyNumber': key,
                    'source': 'keyboardInput'
                }
            }));
            event.preventDefault();
            event.stopPropagation();
            pressed[key] = false;
        }
    };

    changeLayout = function (layout) {
        if (layout !== activeLayoutName) {
            if (layout && keyboardCodeLayouts[layout]) {
                activeLayout = keyboardCodeLayouts[layout];
                activeLayoutName = layout;

                context.dispatchEvent(new CustomEvent('system.keyboard.input.layout.changed', {
                    "detail": activeLayoutName
                }));
            }
        }
    };
    changeLayoutHandler = function (event) {
        changeLayout(event.detail);
    };

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    context.addEventListener('system.keyboard.input.changeLayout', changeLayoutHandler.bind(this));
    context.dispatchEvent(new CustomEvent('system.keyboard.input.initialized', {
        "detail": {
            "active": activeLayoutName,
            "availableLayouts": Object.keys(keyboardCodeLayouts)
        }
    }));
};

module.exports = KeyboardInput;