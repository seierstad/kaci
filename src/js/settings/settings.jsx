import React, {Component} from "react"; import PropTypes from "prop-types";

import {playStateShape} from "../play-state/propdefs";
import {configurationShape} from "../propdefs";

import MidiView from "../midi/views/midi.jsx";
import KeyboardInputView from "../keyboard/views/keyboard-settings.jsx";
import Tuning from "../tuning/views/tuning.jsx";


class SystemSettingsView extends Component {

    static propTypes = {
        "configuration": configurationShape,
        "keyboardHandlers": PropTypes.object,
        "playState": playStateShape,
        "resetHandler": PropTypes.func
    }

    shouldComponentUpdate (nextProps) {
        return (
            this.props.playState !== nextProps.playState
            || this.props.configuration !== nextProps.configuration
        );
    }


    render () {
        const {keyboardHandlers, resetHandler, configuration, playState} = this.props;

        return (
            <section className="system-settings-view">
                <MidiView
                    configuration={configuration.midi}
                    playState={playState.midiClock}
                />
                <KeyboardInputView
                    configuration={configuration.keyboard}
                    handlers={keyboardHandlers}
                />
                <Tuning
                    configuration={configuration.tuning}
                />
                <button onClick={resetHandler}>system reset</button>
            </section>
        );
    }
}


export default SystemSettingsView;