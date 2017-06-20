import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import * as Actions from "../../actions";
import {OSCILLATOR_MODE} from "../../constants";
import {waveforms} from "../../waveforms";
import {getDistortedPhase, mixValues} from "../../shared-functions";
import {oscillatorPatchShape, modulationTargetShape} from "../../propdefs";

import OutputStage from "../output-stage.jsx";
import RangeInput from "../RangeInput.jsx";
import WaveformSelector from "../WaveformSelector.jsx";
import PhaseDistortion from "./phase-distortion.jsx";
import Mix from "./mix.jsx";
import Resonance from "./resonance.jsx";
import Harmonics from "./harmonics.jsx";
import Mode from "./mode.jsx";


class OscillatorPresentation extends Component {

    static propTypes = {
        "configuration": modulationTargetShape.isRequired,
        "envelopeHandlers": PropTypes.object.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": oscillatorPatchShape.isRequired,
        "viewState": PropTypes.object.isRequired
    }

    constructor () {
        super();
        /*
        this.pdFunction0 = this.pdFunction0.bind(this);
        this.pdFunction1 = this.pdFunction1.bind(this);
        this.mixFunction = this.mixFunction.bind(this);
        */
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
        const {configuration, patch, viewState, handlers, envelopeHandlers} = this.props;
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
                <PhaseDistortion
                    handlers={envelopeHandlers}
                    index={0}
                    key="pdEnvelope0"
                    module="oscillator"
                    patch={patch.pd[0]}
                    viewState={viewState.pd[0]}
                    waveFunction={this.pdFunction0}
                    waveformName={patch.waveform}
                />
                <PhaseDistortion
                    handlers={envelopeHandlers}
                    index={1}
                    key="pdEnvelope1"
                    module="oscillator"
                    patch={patch.pd[1]}
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
            "factorChange": (value) => dispatch({type: Actions.OSCILLATOR_RESONANCE_FACTOR_CHANGE, value}),
            "toggle": () => dispatch({"type": Actions.OSCILLATOR_RESONANCE_TOGGLE}),
            "wrapperChange": (waveform) => dispatch({"type": Actions.OSCILLATOR_WRAPPER_CHANGE, "value": waveform})
        },
        "harmonics": {
            "add": (numerator, denominator) => dispatch({type: Actions.HARMONIC_ADD, module: "oscillator", submodule: "harmonics", numerator, denominator}),
            "denominatorChange": (value) => dispatch({type: Actions.HARMONIC_DENOMINATOR_CHANGE, module: "oscillator", submodule: "harmonics", value}),
            "handleNormalize": () => dispatch({type: Actions.HARMONIC_LEVELS_NORMALIZE, module: "oscillator", submodule: "harmonics"}),
            "handleNew": () => dispatch({type: Actions.HARMONIC_NEW, module: "oscillator", submodule: "harmonics"}),
            "levelChange": (value, {numerator, denominator}) => dispatch({type: Actions.HARMONIC_LEVEL_CHANGE, module: "oscillator", submodule: "harmonics", value, numerator, denominator}),
            "numeratorChange": (value) => dispatch({type: Actions.HARMONIC_NUMERATOR_CHANGE, module: "oscillator", submodule: "harmonics", value}),
            "phaseChange": (value, {numerator, denominator}) => dispatch({type: Actions.HARMONIC_PHASE_CHANGE, module: "oscillator", submodule: "harmonics", value, numerator, denominator}),
            "toggle": (module, index, {numerator, denominator}) => dispatch({type: Actions.HARMONIC_TOGGLE, module: "oscillator", submodule: "harmonics", numerator, denominator})
        },
        "outputStageHandlers": {
            "handleToggle": () => dispatch({type: Actions.OUTPUT_TOGGLE, module: "oscillator"}),
            "handleGainInput": (value) => dispatch({type: Actions.OUTPUT_GAIN_CHANGE, value, module: "oscillator"}),
            "handlePanInput": (value) => dispatch({type: Actions.OUTPUT_PAN_CHANGE, value, module: "oscillator"})
        },
        "mode": (mode) => dispatch({type: Actions.OSCILLATOR_MODE_CHANGE, mode}),
        "waveformChange": (waveform) => dispatch({"type": Actions.OSCILLATOR_WAVEFORM_CHANGE, "value": waveform}),
        "mix": (value) => dispatch({"type": Actions.OSCILLATOR_MIX_CHANGE, value}),
        "detune": (value) => dispatch({"type": Actions.OSCILLATOR_DETUNE_CHANGE, value})
    }
});

const Oscillator = connect(null, mapDispatch)(OscillatorPresentation);


export default Oscillator;
