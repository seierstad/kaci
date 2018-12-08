import autobind from "autobind-decorator";

import {CONFIGURATION_SET} from "./actions";
import {LOCALSTORAGE_NAME} from "./constants";


class SystemSettings {
    constructor (context, store) {
        this.store = store;
        this.state = store.getState().settings;

        if (localStorage) {
            const settingsString = localStorage.getItem(LOCALSTORAGE_NAME);
            if (settingsString && settingsString !== "undefined") {
                this.state = JSON.parse(settingsString);

                store.dispatch({
                    "type": CONFIGURATION_SET,
                    "configuration": this.state
                });
            }
        }

        this.unsubscribe = store.subscribe(this.update);
        return this.state;
    }

    storeSettings () {
        if (localStorage) {
            localStorage.setItem(LOCALSTORAGE_NAME, JSON.stringify(this.state));
        }
    }

    @autobind
    update () {
        const newState = this.store.getState().settings;
        if (newState !== this.state) {
            this.state = newState;
            this.storeSettings();
        }
    }
}


export default SystemSettings;
