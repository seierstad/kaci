import React, {Component, PropTypes} from "react";

import {getWrapperFunction} from "./oscillator-commons";
import {waveforms, wrappers} from "../../waveforms";
import * as PropDefs from "../../../proptype-defs";

import DependentComponent from "./dependent-component.jsx";
import RangeInput from "../RangeInput.jsx";
import WaveformSelector from "../WaveformSelector.jsx";
import WaveformCanvas from "./waveform-canvas.jsx";

const wrapWaveform = (wrappers, waveform, resonance) => {
    let wrappedWaveforms = {};

    for (let wrapperName in wrappers) {
        if (wrappers.hasOwnProperty(wrapperName)) {
            wrappedWaveforms[wrapperName] = getWrapperFunction(wrappers[wrapperName], waveform, resonance);
        }
    }
    return wrappedWaveforms;
};


class Resonance extends DependentComponent {

    shouldComponentUpdate(nextProps, nextState) {
        return (
            super.shouldComponentUpdate(nextProps, nextState)
            || nextProps.patch.wrapper !== this.props.patch.wrapper
            || nextProps.patch.resonance  !== this.props.patch.resonance
            || nextProps.patch.resonanceActive  !== this.props.patch.resonanceActive
        );
    }

    componentWillMount () {
        this.setState({"wrappedWaveforms": wrapWaveform(wrappers, waveforms.sinus, 5)});
    }

    render () {
        const {configuration, patch, handlers, waveFunction} = this.props;

        return (
            <div className="oscillator-resonance-view">
                <WaveformCanvas waveFunction={waveFunction} />
                <input type="checkbox" checked={patch.resonanceActive} onChange={handlers.toggle} />
                <RangeInput
                    changeHandler={handlers.factorChange}
                    label="Resonance"
                    max={configuration.max}
                    min={configuration.min}
                    step={0.01}
                    value={patch.resonance}
                />
                <WaveformSelector
                    changeHandler={handlers.wrapperChange}
                    module="oscillator"
                    selected={patch.wrapper}
                    waveforms={this.state.wrappedWaveforms}
                />
            </div>
        );
    }
}
Resonance.propTypes = {
    "configuration": PropDefs.inputRange.isRequired,
    "handlers": PropTypes.object.isRequired,
    "patch": PropDefs.oscillatorPatchData,
    "waveFunction": PropTypes.func.isRequired
};

export default Resonance;
