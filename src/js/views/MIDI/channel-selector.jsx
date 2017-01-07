import React, {Component, PropTypes} from "react";

import {CHANNELS} from "../../midiConstants";
import {midiChannelShape} from "../../propdefs";

let midiChannelSelectorCounter = 0;

class MidiChannelSelector extends Component {
    constructor () {
        super();
        this.uniqeKey = null;
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount () {
        this.uniqeKey = (midiChannelSelectorCounter += 1);
    }

    handleChange (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        const value = parseInt(this.selector.value, 10) || this.selector.value;
        this.props.channelChangeHandler(value);
    }

    render () {
        const {channelChangeHandler, selectedChannel} = this.props;
        const channel= c => <option key={c} value={c}>{(typeof c === "number") ? (c + 1) : c}</option>;

        return (
            <div>
                <label htmlFor={"midi-channel-selector-" + this.uniqeKey}>channel</label>
                <select
                    id={"midi-channel-selector-" + this.uniqeKey}
                    onChange={this.handleChange}
                    ref={s => this.selector = s}
                    value={selectedChannel}
                >
                    {CHANNELS.map(channel)}
                </select>
            </div>
        );
    }
}
MidiChannelSelector.propTypes = {
    "channelChangeHandler": PropTypes.func.isRequired,
    "selectedChannel": midiChannelShape.isRequired
};


export default MidiChannelSelector;
