import React, {PropTypes} from "react";
import MidiView from "./MIDI/midi.jsx";
import KeyboardInputView from "./KeyboardInputView.jsx";

import {keyboardShape} from "../propdefs";

const SystemSettingsView = ({keyboardConfiguration, keyboardHandlers, resetHandler}) => (
    <section className="system-settings-view">
        <MidiView />
        <KeyboardInputView configuration={keyboardConfiguration} handlers={keyboardHandlers} />

        <button onClick={resetHandler}>system reset</button>
    </section>
);
SystemSettingsView.propTypes = {
    "keyboardConfiguration": keyboardShape,
    "keyboardHandlers": PropTypes.object,
    "resetHandler": PropTypes.func
};


export default SystemSettingsView;
