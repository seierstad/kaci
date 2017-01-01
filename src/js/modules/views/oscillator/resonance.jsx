import React, {Component, PropTypes} from "react";

import {getWrapperFunction} from "./oscillator-commons";
import {waveforms, wrappers} from "../../waveforms";
import * as PropDefs from "../../proptype-defs";

import RangeInput from "../RangeInput.jsx";
import WaveformSelector from "../WaveformSelector.jsx";
import WaveformCanvas from "../waveform-canvas.jsx";

const wrapWaveform = (wrappers, waveform, resonance) => {
    let wrappedWaveforms = {};

    for (let wrapperName in wrappers) {
        if (wrappers.hasOwnProperty(wrapperName)) {
            wrappedWaveforms[wrapperName] = getWrapperFunction(wrappers[wrapperName], waveform, resonance);
        }
    }
    return wrappedWaveforms;
};


class Resonance extends Component {

    componentWillMount () {
        this.wrappedWaveforms = wrapWaveform(wrappers, waveforms.sinus, 5);
    }
    componentWillUnmount () {
        this.wrappedWaveforms = null;
    }

    render () {
        const {configuration, patch, handlers, waveFunction} = this.props;

        return (
            <div className="oscillator-resonance-view">
                <WaveformCanvas waveFunction={waveFunction} />
                <input
                    checked={patch.active}
                    onChange={handlers.toggle}
                    type="checkbox"
                />
                <RangeInput
                    changeHandler={handlers.factorChange}
                    label="Resonance"
                    max={configuration.max}
                    min={configuration.min}
                    step={0.01}
                    value={patch.factor}
                />
                <WaveformSelector
                    changeHandler={handlers.wrapperChange}
                    selected={patch.wrapper}
                    waveforms={this.wrappedWaveforms}
                />
            </div>
        );
    }
}
Resonance.propTypes = {
    "configuration": PropDefs.modulationTarget.isRequired,
    "handlers": PropTypes.object.isRequired,
    "patch": PropDefs.resonancePatchData,
    "waveFunction": PropTypes.func.isRequired
};

export default Resonance;
