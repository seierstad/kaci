import React, {PureComponent} from "react";
import PropTypes from "prop-types";

import {PORT} from "../constants";

let midiPortSelectorCounter = 0;


class MidiPortSelector extends PureComponent {

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

        if (ports && ports.length > 0) {
            return (
                <div>
                    <label
                        htmlFor={"midi-port-selector-" + this.uniqeKey}
                        key="label"
                    >
                        port
                    </label>
                    <select
                        className="midi-port-selector"
                        id={"midi-port-selector-" + this.uniqeKey}
                        onChange={portChangeHandler}
                        value={selectedPort}
                    >
                        <option key="none" value="">none</option>
                        {ports.map(p => (
                            <option
                                disabled={p.state === PORT.STATE.DISCONNECTED}
                                key={p.id}
                                value={p.id}
                            >
                                {p.name}{p.manufacturer ? " (" + p.manufacturer + ")" : ""}{p.id === selectedPort && p.state === PORT.STATE.DISCONNECTED ? " DISCONNECTED" : ""}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }
        return null;
    }
}


export default MidiPortSelector;
