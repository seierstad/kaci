import React, {Component, PropTypes} from "react";

import WaveformButton from "./waveform-button.jsx";


let waveformSelectorCounter = 0;

class WaveformSelector extends Component {
    render () {
        const {waveforms, selected, changeHandler, index, module} = this.props;
        const controlName = "waveform-" + waveformSelectorCounter;
        waveformSelectorCounter += 1;
        const sampleAndHoldBuffer = {
            "value": null,
            "phase": 0
        };

        return (
            <fieldset className="waveform-selector">
                <legend>waveform</legend>
                {Object.keys(waveforms).map(w => (
                    <WaveformButton
                        controlName={controlName}
                        index={index}
                        key={w}
                        module={module}
                        onChange={changeHandler}
                        selected={selected === w}
                        waveform={w === "sampleAndHold" ? (phase) => waveforms[w](phase, sampleAndHoldBuffer, 4) : waveforms[w]}
                        waveformName={w}
                    />
                ))}
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
