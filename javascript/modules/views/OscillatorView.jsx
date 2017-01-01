import ReactDOM from "react-dom";
import React, {Component, PropTypes} from "react";

import drawWaveform from "./drawWaveform";
import {waveforms, wrappers} from "../waveforms";
import {getDistortedPhase, mixValues} from "../sharedFunctions";

import {Envelope} from "./EnvelopeView.jsx";
import RangeInput from "./RangeInput.jsx";
import WaveformSelector from "./WaveformSelector.jsx";

import PDOscillator from "../PDOscillator";


const getWrapperFunction = (wrapper, waveform, resonance) => (phase) => {
    return wrapper(phase) * waveform(phase * resonance);
}
const wrapWaveform = (wrappers, waveform, resonance) => {
    var wrapperName,
        wrappedWaveforms = {};

    for (wrapperName in wrappers) {
        if (wrappers.hasOwnProperty(wrapperName)) {
            wrappedWaveforms[wrapperName] = getWrapperFunction(wrappers[wrapperName], waveform, resonance);
        }
    }
    return wrappedWaveforms;
};

class DependentComponent extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        for (let key in this.props.dependencies) {
            if (nextProps.dependencies[key] !== this.props.dependencies[key]) {
                return true;
            }
        }     
        return false;
    }
}
DependentComponent.propTypes = {
    dependencies: PropTypes.object.isRequired
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
    waveFunction: PropTypes.func.isRequired,
    update: PropTypes.bool
}

class PhaseDistortion extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.waveformName !== this.props.waveformName
            || nextProps.patch.steps !== this.props.patch.steps
            || nextProps.viewState !== this.props.viewState
        );
    }

    updateWaveform () {
        drawWaveform(this.props.waveFunction, this.waveform);
    }

    componentDidMount() {
        this.updateWaveform();
    }
    componentDidUpdate(prevProps, prevState) {
        this.updateWaveform();
    }

    render () {
        const {patch, viewState, index, module, handlers} = this.props;

        return (
            <div className="oscillator-pd-view">
                <canvas ref={c => this.waveform = c} />
                <Envelope
                    module="oscillator"
                    index={index}
                    patch={patch}
                    viewState={viewState}
                    handlers={handlers}
                    />
            </div>
        );
    }
}
PhaseDistortion.propTypes = {
    patch: PropTypes.shape({
        "steps": PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
    }),
    viewState: PropTypes.array,
    index: PropTypes.number.isRequired,
    module: PropTypes.string.isRequired,
    handlers: PropTypes.objectOf(PropTypes.func).isRequired,
    waveFunction: PropTypes.func.isRequired,
    waveformName: PropTypes.string.isRequired
}


class Mix extends DependentComponent {

    shouldComponentUpdate(nextProps, nextState) {
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
                    label="Mix"
                    min={configuration.min}
                    max={configuration.max}
                    step={0.01}
                    changeHandler={changeHandler}
                    value={patch}
                    />
            </div>
        );
    }
}


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
        var wrappedWaveforms = wrapWaveform(wrappers, waveforms.sinus, 5);
        this.setState({"wrappedWaveforms": wrappedWaveforms});
    }


    render () {
        const {configuration, patch, handlers, waveFunction} = this.props;

        return (
            <div className="oscillator-resonance-view">
                <WaveformCanvas waveFunction={waveFunction} />
                <input type="checkbox" checked={patch.resonanceActive} onChange={handlers.toggle} />
                <RangeInput
                    label="Resonance"
                    min={configuration.min}
                    max={configuration.max}
                    step={0.01}
                    changeHandler={handlers.factorChange}
                    value={patch.resonance}
                    />
                <WaveformSelector 
                    waveforms={this.state.wrappedWaveforms}
                    selected={patch.wrapper}
                    changeHandler={handlers.wrapperChange}
                    />
            </div>
        );
    }
}


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
        }

        const pd1Props = {
            waveform: patch.waveform,
            pd1steps: patch.pd[1].steps,
            pd1viewState: viewState.pd[1]
        }

        const mixDependencies = {
            ...pd0Props,
            ...pd1Props
        }
        const resonanceDependencies = {
            ...mixDependencies,
            mix: this.props.patch.mix
        }

        return (
            <section className="oscillator-view">
                <WaveformSelector
                    waveforms={waveforms}
                    changeHandler={handlers.waveformChange}
                    selected={patch.waveform}
                    />
                <PhaseDistortion 
                    key="pdEnvelope0"
                    patch={patch.pd[0]}
                    index={0}
                    module="oscillator"
                    waveFunction={this.pdFunction0}
                    viewState={viewState.pd[0]}
                    handlers={envelopeHandlers}
                    waveformName={patch.waveform}
                    />
                <PhaseDistortion
                    key="pdEnvelope1"
                    patch={patch.pd[1]}
                    index={1}
                    module="oscillator"
                    waveFunction={this.pdFunction1}
                    viewState={viewState.pd[1]}
                    handlers={envelopeHandlers}
                    waveformName={patch.waveform}
                    />
                <Mix
                    patch={patch.mix}
                    configuration={configuration.mix}
                    changeHandler={handlers.mix}
                    waveFunction={this.mixFunction}
                    dependencies={mixDependencies}
                    />
                <Resonance 
                    patch={patch}
                    configuration={configuration.resonance}
                    handlers={handlers.resonance}
                    waveFunction={this.resonanceFunction}
                    dependencies={resonanceDependencies}
                    />
                <RangeInput
                    label="Detune"
                    min={configuration.detune.min}
                    max={configuration.detune.max}
                    step={0.01}
                    changeHandler={handlers.detune}
                    value={patch.detune}
                    />
            </section>
        );
    }
}


export default Oscillator;
