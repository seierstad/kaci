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
/*
const getMixedFunction = () => (phase) => {
    var phase0,
        phase1;

    while (phase > 1) {
        phase -= 1;
    }
    phase0 = viewOscillator.getDistortedPhase.call(viewOscillator, phase, viewOscillator.pdEnvelope0);
    phase1 = viewOscillator.getDistortedPhase.call(viewOscillator, phase, viewOscillator.pdEnvelope1);
    return viewOscillator.selectedWaveform.call(viewOscillator,
        viewOscillator.mixValues.call(viewOscillator, phase0, phase1, viewOscillator.mix.value)
    );
};

*/

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
    waveFunction: PropTypes.func.isRequired
}


class Mix extends Component {
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


class Resonance extends Component {

    componentWillMount () {
        var wrappedWaveforms = wrapWaveform(wrappers, waveforms.sinus, 5);
        this.setState({"wrappedWaveforms": wrappedWaveforms});
    }


    render () {
        const {configuration, patch, handlers, waveFunction} = this.props;

        return (
            <div className="oscillator-resonance-view">
                <WaveformCanvas waveFunction={waveFunction} />
                <input type="checkbox" checked={patch.active} onChange={handlers.toggle} />
                <RangeInput
                    label="Resonance"
                    min={configuration.min}
                    max={configuration.max}
                    step={0.01}
                    changeHandler={handlers.factorChange}
                    value={patch.factor}
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
        const {waveform, resonance} = this.props.patch;
        //wrap mixedFunction
        return getWrapperFunction(wrappers[resonance.wrapper], this.mixFunction, resonance.factor)(phase);
    }

    render () {
        const {configuration, patch, viewState, handlers, envelopeHandlers} = this.props;

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
                    />
                <PhaseDistortion
                    key="pdEnvelope1"
                    patch={patch.pd[1]}
                    index={1}
                    module="oscillator"
                    waveFunction={this.pdFunction1}
                    viewState={viewState.pd[1]}
                    handlers={envelopeHandlers}
                    />
                <Mix
                    patch={patch.mix}
                    configuration={configuration.mix}
                    changeHandler={handlers.mix}
                    waveFunction={this.mixFunction}
                    />
                <Resonance 
                    patch={patch.resonance}
                    changeHandler={this.resonanceFactorHandler}
                    configuration={configuration.resonance}
                    handlers={handlers.resonance}
                    waveFunction={this.resonanceFunction}
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
