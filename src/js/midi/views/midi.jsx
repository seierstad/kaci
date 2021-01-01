import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import autobind from "autobind-decorator";

import ModuleToggle from "../../views/module-toggle.jsx";

import {midiShape, midiClockPlayStateShape} from "../propdefs";
import dispatchMap from "../dispatchers";

import ChannelSelector from "./channel-selector.jsx";
import PortSelector from "./port-selector.jsx";


class MidiViewPresentation extends Component {

    static propTypes = {
        "configuration": midiShape,
        "handlers": PropTypes.shape({
            "channelChange":  PropTypes.func.isRequired,
            "portChange": PropTypes.func.isRequired,
            "toggle": PropTypes.func.isRequired
        }).isRequired,
        "playState": midiClockPlayStateShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.playState !== nextProps.playState) || (this.props.configuration !== nextProps.configuration);
    }

    @autobind
    onToggle () {
        this.props.handlers.toggle();
    }

    render () {
        const {configuration, handlers, playState} = this.props;
        const {active, ports, selectedPort, channel} = configuration;

        return (
            <fieldset className="midi-view">
                <legend>MIDI</legend>
                <ModuleToggle
                    active={!!active}
                    handler={this.onToggle}
                />
                <PortSelector
                    portChangeHandler={handlers.portChange}
                    ports={ports}
                    selectedPort={selectedPort}
                />
                {(ports.findIndex(p => p.id === selectedPort) !== -1) && (
                    <ChannelSelector
                        channelChangeHandler={handlers.channelChange}
                        selectedChannel={channel}
                    />
                )}
                {playState.tempo && (<dl><dt>Sync tempo:</dt><dd>{playState.tempo}</dd></dl>)}
            </fieldset>
        );
    }
}


const MidiView = connect(null, dispatchMap)(MidiViewPresentation);

export default MidiView;
