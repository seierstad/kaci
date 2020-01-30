import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {modulationTargetShape} from "../../modulation/propdefs";
import {getDistortedPhase, mixValues} from "../../shared-functions";
import Harmonics from "../../harmonics/views/harmonics.jsx";

import OutputStage from "../../output-stage/views/output-stage.jsx";
import RangeInput from "../../static-source/views/range-input.jsx";
import {waveforms} from "../../waveform/waveforms";
import WaveformSelector from "../../waveform/views/waveform-selector.jsx";

import {OSCILLATOR_MODE} from "../constants";
import {oscillatorPatchShape} from "../propdefs";

import PhaseDistortion from "./phase-distortion.jsx";
import Mix from "./mix.jsx";
import Resonance from "./resonance.jsx";
import Mode from "./mode.jsx";


class Oscillator extends Component {

    static propTypes = {
        "configuration": modulationTargetShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": oscillatorPatchShape.isRequired,
        "viewState": PropTypes.object.isRequired
    }

    constructor () {
        super();
        this.waveforms = {};
    }

    componentWillMount () {
        const {pd, waveform, mix} = this.props.patch;

        for (const w in waveforms) {
            this.waveforms[w] = waveforms[w];
        }

        this.setPdFunction0(pd[0].steps, waveform);
        this.setPdFunction1(pd[1].steps, waveform);
        this.setMixFunction(mix);
    }

    componentWillUpdate (nextProps) {
        const {pd, waveform, mix} = nextProps.patch;


        if (this.props.patch.waveform !== nextProps.patch.waveform) {
            this.setPdFunction0(pd[0].steps, waveform);
            this.setPdFunction1(pd[1].steps, waveform);
            this.setMixFunction(mix);
        } else {
            const pd0Changed = this.props.patch.pd[0] !== pd[0];
            const pd1Changed = this.props.patch.pd[1] !== pd[1];
            const mixChanged = this.props.patch.mix !== mix;

            if (pd0Changed) {
                this.setPdFunction0(pd[0].steps, waveform);
            }
            if (pd1Changed) {
                this.setPdFunction1(pd[1].steps, waveform);
            }
            if (pd0Changed || pd1Changed || mixChanged) {
                this.setMixFunction(mix);
            }
        }
    }

    setPdFunction0 (steps, waveform) {
        const {name: waveformFn, parameter} = waveform;
        const waveFunction = this.waveforms[waveformFn](parameter);

        this.pdFunction0 = (phase) => waveFunction(getDistortedPhase(phase, steps));
    }

    setPdFunction1 (steps, waveform) {
        const {name: waveformFn, parameter} = waveform;
        const waveFunction = this.waveforms[waveformFn](parameter);

        this.pdFunction1 = (phase) => waveFunction(getDistortedPhase(phase, steps));
    }

    setMixFunction (mix) {
        this.mixFunction = (phase) => mixValues(this.pdFunction0(phase), this.pdFunction1(phase), mix);
    }

    render () {
        const {configuration, patch, viewState, handlers} = this.props;
        const {outputStageHandlers} = handlers;


        const pd0Props = {
            waveform: patch.waveform.name,
            pd0steps: patch.pd[0].steps,
            pd0viewState: viewState.pd[0]
        };

        const pd1Props = {
            waveform: patch.waveform.name,
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
                <OutputStage
                    configuration={configuration}
                    handlers={outputStageHandlers}
                    patch={patch}
                />
                <WaveformSelector
                    handlers={handlers.waveform}
                    module="oscillator"
                    patch={patch.waveform}
                    waveforms={this.waveforms}
                />
                <div className="pd-and-mix-wrapper">
                    <PhaseDistortion
                        key="pdEnvelope0"
                        patch={patch.pd[0]}
                        subIndex={0}
                        viewState={viewState.pd[0]}
                        waveform={patch.waveform}
                        waveFunction={this.pdFunction0}
                    />
                    <PhaseDistortion
                        key="pdEnvelope1"
                        patch={patch.pd[1]}
                        subIndex={1}
                        viewState={viewState.pd[1]}
                        waveform={patch.waveform}
                        waveFunction={this.pdFunction1}
                    />
                    <Mix
                        changeHandler={handlers.mix}
                        configuration={configuration.mix}
                        dependencies={mixDependencies}
                        patch={patch.mix}
                        waveFunction={this.mixFunction}
                    />
                </div>
                <Mode
                    handler={handlers.mode}
                    patch={patch.mode}
                >
                    {(patch.mode === OSCILLATOR_MODE.RESONANT) && (
                        <Resonance
                            configuration={configuration.resonance}
                            dependencies={resonanceDependencies}
                            handlers={handlers.resonance}
                            mixFunction={this.mixFunction}
                            patch={patch}
                        />
                    )}
                    {(patch.mode === OSCILLATOR_MODE.HARMONICS) && (
                        <Harmonics
                            configuration={configuration.harmonics}
                            dependencies={resonanceDependencies}
                            handlers={handlers.harmonics}
                            mixFunction={this.mixFunction}
                            patch={patch.harmonics}
                            viewState={viewState.harmonics}
                        />
                    )}
                </Mode>
                <RangeInput
                    changeHandler={handlers.detune}
                    configuration={configuration.detune}
                    label="Detune"
                    value={patch.detune}
                />
            </section>
        );
    }
}

export default Oscillator;
