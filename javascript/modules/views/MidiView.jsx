import React, { Component } from "react";
import { connect } from "react-redux";
import * as Actions from "../Actions.jsx";

class MidiPortSelectorPresentation extends Component {
    render () {
        const { onPortChange, ports, selectedPort } = this.props;
        const port = p => <option key={p.id} value={p.id}>{p.name}{p.manufacturer ? " (" + p.manufacturer + ")" : ""}</option>

        let result;
        if (ports && ports.length > 0) {
            result = (
                <select value={selectedPort} onChange={onPortChange}>
                    <option>select port</option>
                    {ports.map(port)}
                </select>
            )
        } else {
            result = (<span>no MIDI</span>);
        }
        return result;
    }
}
const mapStateToProps = (state) => {
    return {
        ports: state.settings.midi.ports,
        selectedPort: state.settings.midi.selectedPort
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        onPortChange: (event) => {
            const value = event.target.value;
            dispatch({
                type: Actions.MIDI_PORT_SELECT,
                value
            })
        }
    };
};
const MidiPortSelector = connect(
    mapStateToProps,
    mapDispatchToProps
)(MidiPortSelectorPresentation);

class MidiView extends Component {
    render () {

        return (
            <fieldset className="midi-view">
                <legend>midi</legend>
                <MidiPortSelector />
            </fieldset>
        );
    }
};

export default MidiView;
