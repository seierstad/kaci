import React, {Component, PropTypes} from "react";

let midiPortSelectorCounter = 0;

class MidiPortSelector extends Component {
    constructor () {
        super();
        this.uniqeKey = null;
    }
    componentWillMount () {
        this.uniqeKey = (midiPortSelectorCounter += 1);
    }
    render () {
        const {portChangeHandler, ports, selectedPort} = this.props;
        const port = p => <option key={p.id} value={p.id}>{p.name}{p.manufacturer ? " (" + p.manufacturer + ")" : ""}</option>;

        if (ports && ports.length > 0) {
            return (
                <div>
                    <label htmlFor={"midi-channel-selector-" + this.uniqeKey} key="label">port</label>
                    <select
                        id={"midi-channel-selector-" + this.uniqeKey}
                        onChange={portChangeHandler}
                        value={selectedPort}
                    >
                        <option>all</option>
                        {ports.map(port)}
                    </select>
                </div>
            );
        }
        return null;
    }
}
MidiPortSelector.propTypes = {
    "portChangeHandler": PropTypes.func.isRequired,
    "ports": PropTypes.array,
    "selectedPort": PropTypes.string
};


export default MidiPortSelector;
