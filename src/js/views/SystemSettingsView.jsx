import React, {Component, PropTypes} from "react";
import MidiView from "./MIDI/midi.jsx";
import KeyboardInputView from "./KeyboardInputView.jsx";
import Tuning from "./tuning.jsx";

import {keyboardShape, configurationShape, playStateShape} from "../propdefs";


class SystemSettingsView extends Component {

    static propTypes = {
        "configuration": configurationShape,
        "keyboardHandlers": PropTypes.object,
        "playState": playStateShape,
        "resetHandler": PropTypes.func
    }

    render () {
        const {keyboardConfiguration, keyboardHandlers, resetHandler, configuration, playState} = this.props;

        return (
            <section className="system-settings-view">
                <MidiView
                    configuration={configuration.midi}
                    playState={playState.midiClock}
                />
                <KeyboardInputView configuration={configuration.keyboard} handlers={keyboardHandlers} />
                <Tuning />
                <button onClick={resetHandler}>system reset</button>
            </section>
        );
    }
}


export default SystemSettingsView;
