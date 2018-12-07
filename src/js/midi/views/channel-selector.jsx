import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {CHANNELS} from "../constants";
import {midiChannelShape} from "../propdefs";

let midiChannelSelectorCounter = 0;


class MidiChannelSelector extends PureComponent {

    static propTypes = {
        "channelChangeHandler": PropTypes.func.isRequired,
        "selectedChannel": midiChannelShape.isRequired
    }

    constructor () {
        super();
        this.uniqeKey = null;
    }

    componentWillMount () {
        this.uniqeKey = (midiChannelSelectorCounter += 1);
    }

    @autobind
    handleChange (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        const value = parseInt(this.selector.value, 10) || this.selector.value;
        this.props.channelChangeHandler(value);
    }

    render () {
        const {selectedChannel} = this.props;

        return (
            <div>
                <label htmlFor={"midi-channel-selector-" + this.uniqeKey}>channel</label>
                <select
                    id={"midi-channel-selector-" + this.uniqeKey}
                    onChange={this.handleChange}
                    ref={s => this.selector = s}
                    value={selectedChannel}
                >
                    {CHANNELS.map(c => <option key={c} value={c}>{(typeof c === "number") ? (c + 1) : c}</option>)}
                </select>
            </div>
        );
    }
}


export default MidiChannelSelector;
