import React, {PropTypes} from "react";
import MidiView from "./MidiView.jsx";
import KeyboardInputView from "./KeyboardInputView.jsx";

import {keyboardShape, midiShape} from "../propdefs";

const SystemSettingsView = ({midiConfiguration, midiHandlers, keyboardConfiguration, keyboardHandlers}) => (
    <section className="system-settings-view">
        <MidiView configuration={midiConfiguration} handlers={midiHandlers} />
        <KeyboardInputView configuration={keyboardConfiguration} handlers={keyboardHandlers} />
    </section>
);
SystemSettingsView.propTypes = {
    "keyboardConfiguration": keyboardShape,
    "keyboardHandlers": PropTypes.object,
    "midiConfiguration": midiShape,
    "midiHandlers": PropTypes.object
};


export default SystemSettingsView;
