import React, { Component } from "react";
import { connect } from "react-redux";
import * as Actions from "../Actions.jsx";

class MidiPortSelector extends Component {
    render () {
        const { portChangeHandler, ports, selectedPort } = this.props;
        const port = p => <option key={p.id} value={p.id}>{p.name}{p.manufacturer ? " (" + p.manufacturer + ")" : ""}</option>;

        let result;
        if (ports && ports.length > 0) {
            result = (
                <select onChange={portChangeHandler} value={selectedPort}>
                    <option>select port</option>
                    {ports.map(port)}
                </select>
            );
        } else {
            result = (<span>no MIDI</span>);
        }
        return result;
    }
}

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

export default MidiView;
