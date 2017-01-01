const CHORD_SHIFTER_TOGGLE = 32; // space bar

const KeyboardInput = function (context, configuration, store) {

    const state = store.getState().settings.keyboard;
    let activeLayoutName = state.activeLayout;
    let activeLayout = state.layouts.find(layout => layout.name === activeLayoutName);
    const pressed = [];
    const pressedControlKeys = [];

    const keyDownHandler = function (event) {
        if (event.altKey || event.metaKey || event.shiftKey || event.ctrlKey) {
            return true;
        }
        const index = activeLayout.map.indexOf(event.keyCode);
        const key = activeLayout.offset + index;

        if (event.keyCode === 32 || event.keyCode === 27) {
            event.preventDefault();
        }

        if (index !== -1 && !pressed[key]) {
            context.dispatchEvent(new CustomEvent("keyboard.keydown", {
                "detail": {
                    "keyNumber": key,
                    "source": "keyboardInput"
                }
            }));
            event.preventDefault();
            event.stopPropagation();
            pressed[key] = true;
        } else if (event.keyCode === CHORD_SHIFTER_TOGGLE && !pressedControlKeys[CHORD_SHIFTER_TOGGLE]) {
            context.dispatchEvent(new CustomEvent("chordShift.enable", {
                "detail": {
                    "source": "keyboardInput"
                }
            }));
            event.preventDefault();
            event.stopPropagation();
            pressedControlKeys[CHORD_SHIFTER_TOGGLE] = true;
        } else {
            console.log(event.keyCode); // uncomment to get keyCodes for new layouts

        }
    };
    const keyUpHandler = function (event) {
        const index = activeLayout.map.indexOf(event.keyCode);
        const key = activeLayout.offset + index;

        if (index !== -1) {
            context.dispatchEvent(new CustomEvent("keyboard.keyup", {
                "detail": {
                    "keyNumber": key,
                    "source": "keyboardInput"
                }
            }));
            event.preventDefault();
            event.stopPropagation();
            pressed[key] = false;
        } else if (event.keyCode === CHORD_SHIFTER_TOGGLE) {
            context.dispatchEvent(new CustomEvent("chordShift.disable", {
                "detail": {
                    "source": "keyboardInput"
                }
            }));
            event.preventDefault();
            event.stopPropagation();
            pressedControlKeys[CHORD_SHIFTER_TOGGLE] = false;
        }
    };

    const changeLayout = function (layout) {
        if (layout !== activeLayoutName) {
            activeLayout = state.layouts.find(l => l.name === layout);
            activeLayoutName = layout;
        }
    };

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    const update = () => {
        const state = store.getState();
        if (state.settings.keyboard.activeLayout !== activeLayoutName) {
            changeLayout(state.settings.keyboard.activeLayout);
        }
    };
    store.subscribe(update);
};


export default KeyboardInput;
