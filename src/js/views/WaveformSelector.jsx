import React, {Component, PropTypes} from "react";
import autobind from "autobind-decorator";

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

    constructor (props) {
        super(props);
        this.activeButton = null;
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.selected !== this.props.selected;
    }

    componentDidMount () {
        if (this.props.includePhaseIndicator) {
            this.phaseIndicator = this.activeButton.phaseIndicator;
        }
    }

    componentDidUpdate() {
        if (this.props.includePhaseIndicator) {
            this.phaseIndicator = this.activeButton.phaseIndicator;
        }
    }

    @autobind
    handleChange (waveformName) {
        const {changeHandler, module, index} = this.props;
        changeHandler(waveformName, module, index);
    }

    render () {
        const {waveforms, selected, index, module, includePhaseIndicator} = this.props;
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
                    {Object.keys(waveforms).map(waveform => (
                        <WaveformButton
                            controlName={controlName}
                            includePhaseIndicator={!!includePhaseIndicator}
                            index={index}
                            key={waveform}
                            module={module}
                            onChange={this.handleChange}
                            ref={includePhaseIndicator && selected === waveform ? (p => this.activeButton = p) : null}
                            selected={selected === waveform}
                            waveform={waveform === "sampleAndHold" ? (phase) => waveforms[waveform](phase, sampleAndHoldBuffer, 4) : waveforms[waveform]}
                            waveformName={waveform}
                        />
                    ))}
                </div>
            </fieldset>
        );
    }
}


export default WaveformSelector;
