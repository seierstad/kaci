import React, {PropTypes} from "react";

import * as PropDef from "../../proptype-defs";

import MidiView from "./MidiView.jsx";
import KeyboardInputView from "./KeyboardInputView.jsx";


const SystemSettingsView = ({midiConfiguration, midiHandlers, keyboardConfiguration, keyboardHandlers}) => (
    <section className="system-settings-view">
        <MidiView configuration={midiConfiguration} handlers={midiHandlers} />
        <KeyboardInputView configuration={keyboardConfiguration} handlers={keyboardHandlers} />
    </section>
);
SystemSettingsView.propTypes = {
    "keyboardConfiguration": PropDef.keyboard,
    "keyboardHandlers": PropTypes.object,
    "midiConfiguration": PropDef.midi,
    "midiHandlers": PropTypes.object
};

export default SystemSettingsView;
