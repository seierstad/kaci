"use strict";
import * as Actions from "./Actions.jsx";

class KeyboardInput {

    constructor (store) {
        this.changeLayout = this.changeLayout.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.store = store;

        this.state = store.getState().settings.keyboard;
        this.pressed = [];
        this.pressedControlKeys = [];
        this.layout = this.state.layouts.find(layout => layout.name === this.state.activeLayout);

        const update = () => {
            const newState = store.getState().settings.keyboard;
            if (newState.activeLayout !== this.state.activeLayout) {
                this.state = newState;
                this.changeLayout(this.state.activeLayout);
            }
        };
//        store.subscribe(update);

        document.addEventListener("keydown", this.keyDownHandler, false);
        document.addEventListener("keyup", this.keyUpHandler, false);
    }

    keyDownHandler (event) {
        let index,
            key;

        if (event.altKey || event.metaKey || event.shiftKey || event.ctrlKey) {
            return true;
        }
        index = this.layout.map.indexOf(event.keyCode);
        key = this.layout.offset + index;

        if (event.keyCode === 32 || event.keyCode === 27) {
            event.preventDefault();
        }

        if (index !== -1) {
            event.preventDefault();
            event.stopPropagation();
            if (!this.pressed[key]) {
                this.store.dispatch({
                    "type": Actions.KEYBOARD_KEY_DOWN,
                    keyNumber: key
                });
            }
            this.pressed[key] = true;
        } else if (event.keyCode === this.layout.controls.CHORD_SHIFT_TOGGLE && !this.pressedControlKeys[this.layout.controls.CHORD_SHIFT_TOGGLE]) {
            this.store.dispatch({
                "type": Actions.CHORD_SHIFT_ENABLE
            });
            event.preventDefault();
            event.stopPropagation();
            this.pressedControlKeys[this.layout.controls.CHORD_SHIFT_TOGGLE] = true;
        } else {
            console.log(event.keyCode); // uncomment to get keyCodes for new layouts

        }
    }

    keyUpHandler (event) {
        let index,
            key;

        index = this.layout.map.indexOf(event.keyCode);
        key = this.layout.offset + index;

        if (index !== -1) {
            this.store.dispatch({
                "type": Actions.KEYBOARD_KEY_UP,
                keyNumber: key
            });
            event.preventDefault();
            event.stopPropagation();
            this.pressed[key] = false;
        } else if (event.keyCode === this.layout.controls.CHORD_SHIFT_TOGGLE) {
            this.store.dispatch({
                "type": Actions.CHORD_SHIFT_DISABLE
            });
            event.preventDefault();
            event.stopPropagation();
            this.pressedControlKeys[this.layout.controls.CHORD_SHIFT_TOGGLE] = false;
        }
    }

    changeLayout (layout) {
        if (layout !== this.layout.name) {
            this.layout = this.state.layouts.find(l => l.name === layout);
        }
    }

}

module.exports = KeyboardInput;
