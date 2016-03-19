/* global require, document */
"use strict";
var CHORD_SHIFTER_TOGGLE = 32; // space bar

var KeyboardInput = function (context, configuration, store) {
    var keyboardCodeLayouts,
        keyDownHandler,
        keyUpHandler,
        changeLayout,
        changeLayoutHandler,
        activeLayout,
        activeLayoutName,
        pressed,
        pressedControlKeys;

    const state = store.getState().settings.keyboard;

    activeLayoutName = state.activeLayout;
    activeLayout = state.layouts[activeLayoutName];
    pressed = [];
    pressedControlKeys = [];

    keyDownHandler = function (event) {
        var index,
            key;

        if (event.altKey || event.metaKey || event.shiftKey || event.ctrlKey) {
            return true;
        }
        index = activeLayout.map.indexOf(event.keyCode);
        key = activeLayout.offset + index;

        if (event.keyCode === 32 || event.keyCode === 27) {
            event.preventDefault();
        }

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
        } else if (event.keyCode === CHORD_SHIFTER_TOGGLE && !pressedControlKeys[CHORD_SHIFTER_TOGGLE]) {
            context.dispatchEvent(new CustomEvent('chordShift.enable', {
                'detail': {
                    'source': 'keyboardInput'
                }
            }));
            event.preventDefault();
            event.stopPropagation();
            pressedControlKeys[CHORD_SHIFTER_TOGGLE] = true;
        } else {
            console.log(event.keyCode); // uncomment to get keyCodes for new layouts

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
        } else if (event.keyCode === CHORD_SHIFTER_TOGGLE) {
            context.dispatchEvent(new CustomEvent('chordShift.disable', {
                'detail': {
                    'source': 'keyboardInput'
                }
            }));
            event.preventDefault();
            event.stopPropagation();
            pressedControlKeys[CHORD_SHIFTER_TOGGLE] = false;
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

    const update = () => {
        const state = store.getState();
        if (state.settings.keyboard.activeLayout !== activeLayoutName) {
            changeLayout(state.settings.keyboard.activeLayout);
        }
    };
    store.subscribe(update);
};

module.exports = KeyboardInput;