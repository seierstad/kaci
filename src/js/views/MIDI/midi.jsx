import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import * as Actions from "../../actions";
import {midiShape, midiClockPlayStateShape} from "../../propdefs";

import ChannelSelector from "./channel-selector.jsx";
import PortSelector from "./port-selector.jsx";


class MidiViewPresentation extends Component {
    render () {
        const {configuration, handlers, playState} = this.props;
        const {ports, selectedPort, channel} = configuration;

        return (
            <fieldset className="midi-view">
                <legend>MIDI</legend>
                <PortSelector
                    portChangeHandler={handlers.portChange}
                    ports={ports}
                    selectedPort={selectedPort}
                />
                {ports.findIndex(p => p.id === selectedPort) !== -1 ?
                    <ChannelSelector
                        channelChangeHandler={handlers.channelChange}
                        selectedChannel={channel}
                    />
                : null}
                {playState.tempo ?
                    <dl><dt>Sync tempo:</dt><dd>{playState.tempo}</dd></dl>
                : null}
            </fieldset>
        );
    }
}
MidiViewPresentation.propTypes = {
    "configuration": midiShape,
    "handlers": PropTypes.object,
    "playState": midiClockPlayStateShape.isRequired
};

const mapState = (state) => ({
    "configuration": state.settings.midi,
    "playState": state.playState.midiClock
});

const mapDispatch = (dispatch) => ({
    "handlers": {
        "portChange": (event) => {
            const value = event.target.value;
            dispatch({type: Actions.MIDI_PORT_SELECT, value});
        },
        "channelChange": (value) => {dispatch({type: Actions.MIDI_CHANNEL_SELECT, value});}
    }
});

const MidiView = connect(mapState, mapDispatch)(MidiViewPresentation);

export default MidiView;
