import React, {Component, PropTypes} from "react";

import {PORT} from "../../midiConstants";

let midiPortSelectorCounter = 0;

class MidiPortSelector extends Component {

    static propTypes = {
        "portChangeHandler": PropTypes.func.isRequired,
        "ports": PropTypes.array,
        "selectedPort": PropTypes.string
    }

    constructor () {
        super();
        this.uniqeKey = null;
    }

    componentWillMount () {
        this.uniqeKey = (midiPortSelectorCounter += 1);
    }

    render () {
        const {portChangeHandler, ports, selectedPort} = this.props;
        const port = p => <option disabled={p.state === PORT.STATE.DISCONNECTED} key={p.id} value={p.id}>{p.name}{p.manufacturer ? " (" + p.manufacturer + ")" : "" }{p.id === selectedPort && p.state === PORT.STATE.DISCONNECTED ? " DISCONNECTED" : ""}</option>;

        if (ports && ports.length > 0) {
            return (
                <div>
                    <label htmlFor={"midi-port-selector-" + this.uniqeKey} key="label">port</label>
                    <select
                        className="midi-port-selector"
                        id={"midi-port-selector-" + this.uniqeKey}
                        onChange={portChangeHandler}
                        value={selectedPort}
                    >
                        <option value="">none</option>
                        {ports.map(port)}
                    </select>
                </div>
            );
        }
        return null;
    }
}


export default MidiPortSelector;
