import React, {PropTypes} from "react";
import MidiView from "./MIDI/midi.jsx";
import KeyboardInputView from "./KeyboardInputView.jsx";

import {keyboardShape} from "../propdefs";

const SystemSettingsView = ({keyboardConfiguration, keyboardHandlers}) => (
    <section className="system-settings-view">
        <MidiView />
        <KeyboardInputView configuration={keyboardConfiguration} handlers={keyboardHandlers} />
    </section>
);
SystemSettingsView.propTypes = {
    "keyboardConfiguration": keyboardShape,
    "keyboardHandlers": PropTypes.object
};


export default SystemSettingsView;
