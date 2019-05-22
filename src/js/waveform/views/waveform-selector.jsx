import React, {Component} from "react";
import PropTypes from "prop-types";
import {boundMethod} from "autobind-decorator";

import Range from "../../static-source/views/range-input.jsx";

import WaveformButton from "./waveform-button.jsx";


let waveformSelectorCounter = 0;

class WaveformSelector extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "includePhaseIndicator": PropTypes.bool,
        "index": PropTypes.number,
        "module": PropTypes.string.isRequired,
        "patch": PropTypes.object.isRequired,
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
        return (
            nextProps.patch !== this.props.patch
        );
    }

    componentDidUpdate () {
        if (this.props.includePhaseIndicator) {
            this.phaseIndicator = this.activeButton.phaseIndicator;
        }
    }

    @boundMethod
    handleFunctionChange (waveformName) {
        const {
            handlers: {
                functionChange
            } = {},
            index
        } = this.props;

        functionChange(waveformName, index);
    }

    @boundMethod
    waveformParameterChangeHandler (value) {
        const {
            handlers: {
                parameterChange
            } = {},
            index
        } = this.props;

        parameterChange(value, index);
    }

    render () {
        const {
            waveforms,
            includePhaseIndicator,
            patch: {
                "name": selected,
                parameter
            } = {}
        } = this.props;
        const controlName = "waveform-" + waveformSelectorCounter;
        waveformSelectorCounter += 1;

        const sampleAndHoldBuffer = {
            "value": null,
            "phase": 0
        };

        return (
            <fieldset className="waveform-selector" onChange={this.handleFunctionChange}>
                <legend>waveform</legend>
                <div className="flex-wrapper">
                    {Object.keys(waveforms).map(waveform => (
                        <WaveformButton
                            controlName={controlName}
                            includePhaseIndicator={!!includePhaseIndicator}
                            key={waveform}
                            onChange={this.handleFunctionChange}
                            parameter={parameter}
                            ref={includePhaseIndicator && selected === waveform ? (p => this.activeButton = p) : null}
                            selected={selected === waveform}
                            waveform={waveform === "sampleAndHold" ? (phase) => waveforms[waveform](phase, sampleAndHoldBuffer, 4) : waveforms[waveform](parameter)}
                            waveformName={waveform}
                        />
                    ))}
                </div>
                <Range
                    changeHandler={this.waveformParameterChangeHandler}
                    configuration={{min: 0, max: 1, mid: 0.5}}
                    label="waveform parameter"
                    max={1}
                    min={0}
                    value={parameter}
                />
            </fieldset>
        );
    }
}


export default WaveformSelector;
