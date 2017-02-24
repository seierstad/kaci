import React, {Component, PropTypes} from "react";

import {waveforms, wrappers} from "../../waveforms";
import {oscillatorPatchShape, rangeShape} from "../../propdefs";

import WaveformSelector from "../WaveformSelector.jsx";
import RangeInput from "../RangeInput.jsx";
import WaveformCanvas from "./waveform-canvas.jsx";


const getWrapperFunction = (wrapper, waveform, resonance) => (phase) => {
    return wrapper(phase) * waveform(phase * resonance);
};

const wrapWaveform = (wrappers, waveform, resonance) => {
    let wrappedWaveforms = {},
        wrapperName;

    for (wrapperName in wrappers) {
        if (wrappers.hasOwnProperty(wrapperName)) {
            wrappedWaveforms[wrapperName] = getWrapperFunction(wrappers[wrapperName](), waveform, resonance);
        }
    }
    return wrappedWaveforms;
};


class Resonance extends Component {

    static propTypes = {
        "configuration": rangeShape.isRequired,
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "mixFunction": PropTypes.func.isRequired,
        "patch": oscillatorPatchShape.isRequired
    }

    constructor () {
        super();
        this.waveFunction = () => 0;
        this.waveFunction = this.waveFunction.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    componentWillMount () {
        const {patch, mixFunction} = this.props;
        const {wrapper, resonance} = patch;
        const {name, parameters} = wrapper;
        const wrapperFunction = (name && parameters) ? wrappers[name](parameters) : wrappers[wrapper]();
        this.waveFunction = getWrapperFunction(wrapperFunction, mixFunction, resonance);

        this.wrappedWaveforms = wrapWaveform(wrappers, waveforms.sinus(), 5);

    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch.resonance !== nextProps.patch.resonance
                || this.props.patch.resonanceActive !== nextProps.resonanceActive
                || this.props.patch.wrapper !== nextProps.patch.wrapper
                || this.props.mixFunction !== nextProps.mixFunction;
    }

    componentWillUpdate (nextProps) {
        const {patch, mixFunction} = nextProps;
        const {wrapper, resonance} = patch;
        const {name, parameters} = wrapper;
        const wrapperFunction = (name && parameters) ? wrappers[name](parameters) : wrappers[wrapper]();
        this.waveFunction = getWrapperFunction(wrapperFunction, mixFunction, resonance);
    }

    handleToggle (event) {
        this.props.handlers.toggle();
    }

    render () {
        const {configuration, patch, handlers} = this.props;
        const {resonance, resonanceActive, wrapper} = patch;

        return (
            <div className="oscillator-resonance-view">
                <WaveformCanvas waveFunction={this.waveFunction} />
                <input checked={!!resonanceActive} onChange={this.handleToggle} type="checkbox" />
                <RangeInput
                    changeHandler={handlers.factorChange}
                    configuration={configuration}
                    label="Resonance"
                    value={resonance}
                />
                <WaveformSelector
                    changeHandler={handlers.wrapperChange}
                    module="oscillator"
                    selected={wrapper}
                    waveforms={this.wrappedWaveforms}
                />
            </div>
        );
    }
}


export default Resonance;
