import React, {Component, PropTypes} from "react";

import * as PropDefs from "../../proptype-defs";

import MidiPortSelector from "./midi-port-selector.jsx";


class MidiView extends Component {
    render () {
        const {configuration, handlers} = this.props;
        return (
            <fieldset className="midi-view">
                <legend>midi</legend>
                <MidiPortSelector
                    portChangeHandler={handlers.portChange}
                    ports={configuration.ports}
                    selectedPort={configuration.selectedPort}
                />
            </fieldset>
        );
    }
}
MidiView.propTypes = {
    "configuration": PropDefs.midi.isRequired,
    "handlers": PropTypes.object.isRequired
};

export default MidiView;
