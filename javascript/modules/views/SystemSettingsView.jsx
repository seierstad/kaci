import React from "react";
import MidiView from "./MidiView.jsx";
import KeyboardInputView from "./KeyboardInputView.jsx";


const SystemSettingsView = ({midiConfiguration, midiHandlers, keyboardConfiguration, keyboardHandlers}) => (
	<section className="system-settings-view">
		<MidiView configuration={midiConfiguration} handlers={midiHandlers} />
		<KeyboardInputView configuration={keyboardConfiguration} handlers={keyboardHandlers} />
	</section>
);

export default SystemSettingsView;