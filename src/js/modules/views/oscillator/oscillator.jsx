import React, {Component, PropTypes} from "react";

import * as PropDefs from "../../../proptype-defs";
import {waveforms, wrappers} from "../../waveforms";
import {getDistortedPhase, mixValues} from "../../sharedFunctions";
import {getWrapperFunction} from "./oscillator-commons";

import RangeInput from "../RangeInput.jsx";
import WaveformSelector from "../WaveformSelector.jsx";
import Mix from "./mix.jsx";
import Resonance from "./resonance.jsx";
import PhaseDistortion from "./phase-distortion.jsx";


class Oscillator extends Component {
    constructor () {
        super();
        this.pdFunction0 = this.pdFunction0.bind(this);
        this.pdFunction1 = this.pdFunction1.bind(this);
        this.mixFunction = this.mixFunction.bind(this);
        this.resonanceFunction = this.resonanceFunction.bind(this);
    }
    pdFunction0 (phase) {
        const {pd, waveform} = this.props.patch;
        const p = getDistortedPhase(phase, pd[0].steps);
        return waveforms[waveform](p);
    }
    pdFunction1 (phase) {
        const {pd, waveform} = this.props.patch;
        const p = getDistortedPhase(phase, pd[1].steps);
        return waveforms[waveform](p);
    }
    mixFunction (phase) {
        const {mix} = this.props.patch;
        return mixValues(this.pdFunction0(phase), this.pdFunction1(phase), mix);
    }
    resonanceFunction (phase) {
        const {waveform, wrapper, resonance} = this.props.patch;
        //wrap mixedFunction
        return getWrapperFunction(wrappers[wrapper], this.mixFunction, resonance)(phase);
    }

    render () {
        const {configuration, patch, viewState, handlers, envelopeHandlers} = this.props;

        const pd0Props = {
            waveform: patch.waveform,
            pd0steps: patch.pd[0].steps,
            pd0viewState: viewState.pd[0]
        };

        const pd1Props = {
            waveform: patch.waveform,
            pd1steps: patch.pd[1].steps,
            pd1viewState: viewState.pd[1]
        };

        const mixDependencies = {
            ...pd0Props,
            ...pd1Props
        };

        const resonanceDependencies = {
            ...mixDependencies,
            mix: this.props.patch.mix
        };

        return (
            <section className="oscillator-view">
                <WaveformSelector
                    changeHandler={handlers.waveformChange}
                    module="oscillator"
                    selected={patch.waveform}
                    waveforms={waveforms}
                />
                <PhaseDistortion
                    handlers={envelopeHandlers}
                    index={0}
                    key="pdEnvelope0"
                    module="oscillator"
                    patch={patch.pd[0]}
                    viewState={viewState.pd[0]}
                    waveformName={patch.waveform}
                    waveFunction={this.pdFunction0}
                />
                <PhaseDistortion
                    handlers={envelopeHandlers}
                    index={1}
                    key="pdEnvelope1"
                    module="oscillator"
                    patch={patch.pd[1]}
                    viewState={viewState.pd[1]}
                    waveformName={patch.waveform}
                    waveFunction={this.pdFunction1}
                />
                <Mix
                    changeHandler={handlers.mix}
                    configuration={configuration.mix}
                    dependencies={mixDependencies}
                    patch={patch.mix}
                    waveFunction={this.mixFunction}
                />
                <Resonance
                    changeHandler={this.resonanceFactorHandler}
                    configuration={configuration.resonance}
                    dependencies={resonanceDependencies}
                    handlers={handlers.resonance}
                    patch={patch}
                    waveFunction={this.resonanceFunction}
                />
                <RangeInput
                    changeHandler={handlers.detune}
                    label="Detune"
                    max={configuration.detune.max}
                    min={configuration.detune.min}
                    step={0.01}
                    value={patch.detune}
                />
            </section>
        );
    }
}
Oscillator.propTypes = {
    "configuration": PropDefs.modulationTarget.isRequired,
    "envelopeHandlers": PropTypes.object.isRequired,
    "handlers": PropTypes.object.isRequired,
    "patch": PropDefs.oscillatorPatchData.isRequired,
    "viewState": PropTypes.object.isRequired
};


export default Oscillator;
