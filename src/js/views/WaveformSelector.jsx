import React, {Component, PropTypes} from "react";

import WaveformButton from "./waveform-button.jsx";


let waveformSelectorCounter = 0;

class WaveformSelector extends Component {

    static propTypes = {
        "changeHandler": PropTypes.func.isRequired,
        "includePhaseIndicator": PropTypes.bool,
        "index": PropTypes.number,
        "module": PropTypes.string.isRequired,
        "selected": PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                "name": PropTypes.string.isRequired,
                "parameters": PropTypes.object.isRequired
            })
        ]),
        "waveforms": PropTypes.objectOf(PropTypes.func).isRequired
    }

    constructor () {
        super();
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange (waveformName) {
        const {changeHandler, module, index} = this.props;
        changeHandler(waveformName, module, index);
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.selected !== this.props.selected;
    }

    render () {
        const {waveforms, selected, changeHandler, index, module, includePhaseIndicator} = this.props;
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
                            includePhaseIndicator={!!includePhaseIndicator}
                            index={index}
                            key={w}
                            module={module}
                            onChange={this.handleChange}
                            ref={includePhaseIndicator && selected === w ? (p => this.activeButton = p) : null}
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


export default WaveformSelector;
