import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import WaveformButton from "./waveform-button.jsx";


let waveformSelectorCounter = 0;

class WaveformSelector extends Component {

    static propTypes = {
        "changeHandler": PropTypes.func.isRequired,
        "includePhaseIndicator": PropTypes.bool,
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

    componentDidMount () {
        if (this.props.includePhaseIndicator) {
            this.phaseIndicator = this.activeButton.phaseIndicator;
        }
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.selected !== this.props.selected;
    }

    componentDidUpdate () {
        if (this.props.includePhaseIndicator) {
            this.phaseIndicator = this.activeButton.phaseIndicator;
        }
    }

    @autobind
    handleChange (waveformName) {
        const {changeHandler} = this.props;
        changeHandler(waveformName);
    }

    render () {
        const {waveforms, selected, includePhaseIndicator} = this.props;
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
                            key={waveform}
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
