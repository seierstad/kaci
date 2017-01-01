import React, {Component, PropTypes} from "react";


class MidiPortSelector extends Component {
    render () {
        const {portChangeHandler, ports, selectedPort} = this.props;
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
MidiPortSelector.propTypes = {
    "portChangeHandler": PropTypes.func.isRequired,
    "ports": PropTypes.array,
    "selectedPort": PropTypes.string
};

export default MidiPortSelector;
