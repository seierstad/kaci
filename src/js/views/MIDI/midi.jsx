import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import autobind from "autobind-decorator";

import * as Actions from "../../actions";
import {midiShape, midiClockPlayStateShape} from "../../propdefs";

import ModuleToggle from "../module-toggle.jsx";

import ChannelSelector from "./channel-selector.jsx";
import PortSelector from "./port-selector.jsx";


class MidiViewPresentation extends Component {

    static propTypes = {
        "configuration": midiShape,
        "handlers": PropTypes.shape({
            "toggle": PropTypes.func.isRequired
        }).isRequired,
        "playState": midiClockPlayStateShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.playState !== nextProps.playState) || (this.props.configuration !== nextProps.configuration);
    }

    @autobind
    handleToggle (event) {
        this.props.handlers.toggle();
    }

    render () {
        const {configuration, handlers, playState} = this.props;
        const {active, ports, selectedPort, channel} = configuration;
        const {handleToggle} = handlers;

        return (
            <fieldset className="midi-view">
                <legend>MIDI</legend>
                <ModuleToggle
                    active={!!active}
                    handler={this.handleToggle}
                />
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
                    :
                    null
                }
                {playState.tempo ?
                    <dl><dt>Sync tempo:</dt><dd>{playState.tempo}</dd></dl>
                    :
                    null
                }
            </fieldset>
        );
    }
}


const mapDispatch = (dispatch) => ({
    "handlers": {
        "portChange": (event) => {
            const value = event.target.value;
            dispatch({type: Actions.MIDI.PORT_SELECT, value});
        },
        "channelChange": (value) => {dispatch({type: Actions.MIDI.CHANNEL_SELECT, value});},
        "toggle": () => dispatch({type: Actions.MIDI.TOGGLE})
    }
});

const MidiView = connect(null, mapDispatch)(MidiViewPresentation);

export default MidiView;
