import MidiView from "./MidiView.jsx";
import KeyboardInputView from "./KeyboardInputView.jsx";
import React, { Component } from "react";

class SystemSettingsView extends Component {
	render () {	    
	    return (
	    	<section className="system-settings-view">
	    		<MidiView />
	    		<KeyboardInputView />
	    	</section>
	    );
	}
};

module.exports = SystemSettingsView;