import React, {Component, PropTypes} from "react";

import drawWaveform from "./drawWaveform";
import {waveforms, wrappers} from "../waveforms";
import {getDistortedPhase, mixValues} from "../sharedFunctions";

import Envelope from "./envelope/envelope.jsx";
import RangeInput from "./RangeInput.jsx";
import WaveformSelector from "./WaveformSelector.jsx";
import DependentComponent from "./dependent-component.jsx";


const getWrapperFunction = (wrapper, waveform, resonance) => (phase) => {
    return wrapper(phase) * waveform(phase * resonance);
};
const wrapWaveform = (wrappers, waveform, resonance) => {
    let wrapperName,
        wrappedWaveforms = {};

    for (wrapperName in wrappers) {
        if (wrappers.hasOwnProperty(wrapperName)) {
            wrappedWaveforms[wrapperName] = getWrapperFunction(wrappers[wrapperName], waveform, resonance);
        }
    }
    return wrappedWaveforms;
};


class WaveformCanvas extends Component {
    constructor () {
        super();
        this.updateWaveform = this.updateWaveform.bind(this);
    }
    updateWaveform () {
        drawWaveform(this.props.waveFunction, this.waveform);
    }
    componentDidMount () {
        this.updateWaveform();
    }
    componentDidUpdate () {
        this.updateWaveform();
    }
    render () {
        return (
            <canvas ref={c => this.waveform = c} />
        );
    }
}
WaveformCanvas.propTypes = {
    update: PropTypes.bool,
    waveFunction: PropTypes.func.isRequired
};

class PhaseDistortion extends Component {

    shouldComponentUpdate (nextProps, nextState) {
        return (
            nextProps.waveformName !== this.props.waveformName
            || nextProps.patch.steps !== this.props.patch.steps
            || nextProps.viewState !== this.props.viewState
        );
    }

    updateWaveform () {
        drawWaveform(this.props.waveFunction, this.waveform);
    }

    componentDidMount () {
        this.updateWaveform();
    }
    componentDidUpdate (prevProps, prevState) {
        this.updateWaveform();
    }

    render () {
        const {patch, viewState, index, module, handlers} = this.props;

        return (
            <div className="oscillator-pd-view">
                <canvas ref={c => this.waveform = c} />
                <Envelope
                    handlers={handlers}
                    index={index}
                    module="oscillator"
                    patch={patch}
                    viewState={viewState}
                />
            </div>
        );
    }
}
PhaseDistortion.propTypes = {
    handlers: PropTypes.objectOf(PropTypes.func).isRequired,
    index: PropTypes.number.isRequired,
    module: PropTypes.string.isRequired,
    patch: PropTypes.shape({
        "steps": PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
    }),
    viewState: PropTypes.array,
    waveFunction: PropTypes.func.isRequired,
    waveformName: PropTypes.string.isRequired
};


class Mix extends DependentComponent {

    shouldComponentUpdate (nextProps, nextState) {
        return (
            super.shouldComponentUpdate(nextProps, nextState)
            || nextProps.patch !== this.props.patch
        );
    }
    render () {
        const {configuration, patch, changeHandler, waveFunction} = this.props;

        return (
            <div className="oscillator-mix-view">
                <WaveformCanvas waveFunction={waveFunction} />
                <RangeInput
                    changeHandler={changeHandler}
                    label="Mix"
                    max={configuration.max}
                    min={configuration.min}
                    step={0.01}
                    value={patch}
                />
            </div>
        );
    }
}


class Resonance extends DependentComponent {

    shouldComponentUpdate (nextProps, nextState) {
        return (
            super.shouldComponentUpdate(nextProps, nextState)
            || nextProps.patch.wrapper !== this.props.patch.wrapper
            || nextProps.patch.resonance !== this.props.patch.resonance
            || nextProps.patch.resonanceActive !== this.props.patch.resonanceActive
        );
    }

    componentWillMount () {
        let wrappedWaveforms = wrapWaveform(wrappers, waveforms.sinus, 5);
        this.setState({"wrappedWaveforms": wrappedWaveforms});
    }


    render () {
        const {configuration, patch, handlers, waveFunction} = this.props;

        return (
            <div className="oscillator-resonance-view">
                <WaveformCanvas waveFunction={waveFunction} />
                <input checked={patch.resonanceActive} onChange={handlers.toggle} type="checkbox" />
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

import {oscillatorPatchDataShape, modulationTargetShape} from "../propdefs";

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
                <Resonance
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
    "configuration": modulationTargetShape.isRequired,
    "envelopeHandlers": PropTypes.object.isRequired,
    "handlers": PropTypes.object.isRequired,
    "patch": oscillatorPatchDataShape.isRequired,
    "viewState": PropTypes.object.isRequired
};


export default Oscillator;
