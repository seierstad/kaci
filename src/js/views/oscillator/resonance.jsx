import React, {Component} from "react"; import PropTypes from "prop-types";

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
                || this.props.patch.mode !== nextProps.mode
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

    render () {
        const {configuration, patch, handlers} = this.props;
        const {resonance, wrapper} = patch;

        return (
            <div className="oscillator-resonance-view">
                <WaveformCanvas waveFunction={this.waveFunction} />
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
