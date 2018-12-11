import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {modulationTargetShape} from "../../modulation/propdefs";
import {getDistortedPhase, mixValues} from "../../shared-functions";
import Harmonics from "../../harmonics/views/harmonics.jsx";
import * as HARMONIC from "../../harmonics/actions";
import OutputStage from "../../output-stage/views/output-stage.jsx";
import RangeInput from "../../static-source/views/range-input.jsx";
import * as OUTPUT from "../../output-stage/actions";

import * as OSCILLATOR from "../actions";
import {OSCILLATOR_MODE} from "../constants";
import {waveforms} from "../waveforms";
import {oscillatorPatchShape} from "../propdefs";

import WaveformSelector from "./waveform-selector.jsx";
import PhaseDistortion from "./phase-distortion.jsx";
import Mix from "./mix.jsx";
import Resonance from "./resonance.jsx";
import Mode from "./mode.jsx";


class OscillatorPresentation extends Component {

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
            this.waveforms[w] = waveforms[w]();
        }

        this.setPdFunction0(pd[0].steps, waveform);
        this.setPdFunction1(pd[1].steps, waveform);
        this.setMixFunction(mix);
    }

    componentWillUpdate (nextProps) {
        const {pd, waveform, mix} = nextProps.patch;


        if (this.props.patch.waveform !== waveform) {
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
        const waveFunction = this.waveforms[waveform];

        this.pdFunction0 = (phase) => waveFunction(getDistortedPhase(phase, steps));
    }

    setPdFunction1 (steps, waveform) {
        const waveFunction = this.waveforms[waveform];

        this.pdFunction1 = (phase) => waveFunction(getDistortedPhase(phase, steps));
    }

    setMixFunction (mix) {
        this.mixFunction = (phase) => mixValues(this.pdFunction0(phase), this.pdFunction1(phase), mix);
    }

    render () {
        const {configuration, patch, viewState, handlers} = this.props;
        const {outputStageHandlers} = handlers;


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
                <OutputStage
                    configuration={configuration}
                    handlers={outputStageHandlers}
                    patch={patch}
                />
                <WaveformSelector
                    changeHandler={handlers.waveformChange}
                    module="oscillator"
                    selected={patch.waveform}
                    waveforms={this.waveforms}
                />
                <div className="pd-and-mix-wrapper">
                    <PhaseDistortion
                        index={0}
                        key="pdEnvelope0"
                        module="oscillator"
                        patch={patch.pd[0]}
                        subIndex={0}
                        viewState={viewState.pd[0]}
                        waveFunction={this.pdFunction0}
                        waveformName={patch.waveform}
                    />
                    <PhaseDistortion
                        index={1}
                        key="pdEnvelope1"
                        module="oscillator"
                        patch={patch.pd[1]}
                        subIndex={1}
                        viewState={viewState.pd[1]}
                        waveFunction={this.pdFunction1}
                        waveformName={patch.waveform}
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
                    {(patch.mode === OSCILLATOR_MODE.RESONANT) ? (
                        <Resonance
                            configuration={configuration.resonance}
                            dependencies={resonanceDependencies}
                            handlers={handlers.resonance}
                            mixFunction={this.mixFunction}
                            patch={patch}
                        />
                    ) : null}
                    {(patch.mode === OSCILLATOR_MODE.HARMONICS) ? (
                        <Harmonics
                            configuration={configuration.harmonics}
                            dependencies={resonanceDependencies}
                            handlers={handlers.harmonics}
                            mixFunction={this.mixFunction}
                            patch={patch.harmonics}
                            viewState={viewState.harmonics}
                        />
                    ) : null}
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


const mapDispatch = (dispatch) => ({
    "handlers": {
        "resonance": {
            "factorChange": (value) => dispatch({type: OSCILLATOR.RESONANCE_FACTOR_CHANGE, value}),
            "toggle": () => dispatch({"type": OSCILLATOR.RESONANCE_TOGGLE}),
            "wrapperChange": (waveform) => dispatch({"type": OSCILLATOR.WRAPPER_CHANGE, "value": waveform})
        },
        "harmonics": {
            "add": (numerator, denominator) => dispatch({type: HARMONIC.ADD, module: "oscillator", submodule: "harmonics", numerator, denominator}),
            "denominatorChange": (value) => dispatch({type: HARMONIC.DENOMINATOR_CHANGE, module: "oscillator", submodule: "harmonics", value}),
            "handleNormalize": () => dispatch({type: HARMONIC.LEVELS_NORMALIZE, module: "oscillator", submodule: "harmonics"}),
            "handleNew": () => dispatch({type: HARMONIC.NEW, module: "oscillator", submodule: "harmonics"}),
            "levelChange": (value, {numerator, denominator}) => dispatch({type: HARMONIC.LEVEL_CHANGE, module: "oscillator", submodule: "harmonics", value, numerator, denominator}),
            "numeratorChange": (value) => dispatch({type: HARMONIC.NUMERATOR_CHANGE, module: "oscillator", submodule: "harmonics", value}),
            "phaseChange": (value, {numerator, denominator}) => dispatch({type: HARMONIC.PHASE_CHANGE, module: "oscillator", submodule: "harmonics", value, numerator, denominator}),
            "remove": (module, index, {numerator, denominator}) => dispatch({type: HARMONIC.REMOVE, module: "oscillator", submodule: "harmonics", numerator, denominator}),
            "toggle": (module, index, {numerator, denominator}) => dispatch({type: HARMONIC.TOGGLE, module: "oscillator", submodule: "harmonics", numerator, denominator})
        },
        "outputStageHandlers": {
            "handleToggle": () => dispatch({type: OUTPUT.TOGGLE, module: "oscillator"}),
            "handleGainInput": (value) => dispatch({type: OUTPUT.GAIN_CHANGE, value, module: "oscillator"}),
            "handlePanInput": (value) => dispatch({type: OUTPUT.PAN_CHANGE, value, module: "oscillator"})
        },
        "mode": (mode) => dispatch({type: OSCILLATOR.MODE_CHANGE, mode}),
        "waveformChange": (waveform) => dispatch({"type": OSCILLATOR.WAVEFORM_CHANGE, "value": waveform}),
        "mix": (value) => dispatch({"type": OSCILLATOR.MIX_CHANGE, value}),
        "detune": (value) => dispatch({"type": OSCILLATOR.DETUNE_CHANGE, value})
    }
});

const Oscillator = connect(null, mapDispatch)(OscillatorPresentation);


export default Oscillator;
