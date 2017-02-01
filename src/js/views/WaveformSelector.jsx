import React, {Component, PropTypes} from "react";

import WaveformButton from "./waveform-button.jsx";


let waveformSelectorCounter = 0;

class WaveformSelector extends Component {
    constructor () {
        super();
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange (waveformName) {
        const {changeHandler, module, index} = this.props;
        changeHandler(waveformName, module, index);
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.selected !== this.props.selected;
    }

    render () {
        const {waveforms, selected, changeHandler, index, module} = this.props;
        const controlName = "waveform-" + waveformSelectorCounter;
        waveformSelectorCounter += 1;
        const sampleAndHoldBuffer = {
            "value": null,
            "phase": 0
        };

        return (
            <fieldset className="waveform-selector" onChange={this.handleChange}>
                <legend>waveform</legend>
                <div className="flex-wrapper">
                    {Object.keys(waveforms).map(w => (
                        <WaveformButton
                            controlName={controlName}
                            index={index}
                            key={w}
                            module={module}
                            onChange={this.handleChange}
                            selected={selected === w}
                            waveform={w === "sampleAndHold" ? (phase) => waveforms[w](phase, sampleAndHoldBuffer, 4) : waveforms[w]}
                            waveformName={w}
                        />
                    ))}
                </div>
            </fieldset>
        );
    }
}
WaveformSelector.propTypes = {
    "changeHandler": PropTypes.func.isRequired,
    "index": PropTypes.number,
    "module": PropTypes.string.isRequired,
    "selected": PropTypes.string,
    "waveforms": PropTypes.objectOf(PropTypes.func).isRequired
};


export default WaveformSelector;
