import React, {Component} from "react";
import PropTypes from "prop-types";

import RangeInput from "../../static-source/views/range-input.jsx";
import {rangeShape} from "../../static-source/propdefs";
import {waveforms, wrappers} from "../../waveform/waveforms";
import WaveformSelector from "../../waveform/views/waveform-selector.jsx";
import WaveformCanvas from "../../waveform/views/waveform-canvas.jsx";

import {oscillatorPatchShape} from "../propdefs";


const getWrapperFunction = (wrapper, waveform, resonance) => {
    return (parameter) => {
        const paramWrapper = wrapper(parameter);
        return (phase) => paramWrapper(phase) * waveform(phase * resonance);
    };
};

const wrapWaveform = (wrappers, waveform, resonance) => {
    let wrappedWaveforms = {},
        wrapperName;

    for (wrapperName in wrappers) {
        if (wrappers.hasOwnProperty(wrapperName)) {
            wrappedWaveforms[wrapperName] = getWrapperFunction(wrappers[wrapperName], waveform, resonance);
        }
    }
    return wrappedWaveforms;
};


class Resonance extends Component {

    static propTypes = {
        "configuration": rangeShape.isRequired,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "mixFunction": PropTypes.func.isRequired,
        "patch": oscillatorPatchShape.isRequired
    }

    constructor () {
        super();
        this.waveFunction = () => 0;
    }

    componentWillMount () {
        const {patch, mixFunction} = this.props;
        const {wrapper, resonance} = patch;
        const {name, parameter} = wrapper;
        const wrapperFunction = wrappers[name];
        this.waveFunction = getWrapperFunction(wrapperFunction, mixFunction, resonance)(parameter);

        this.wrappedWaveforms = wrapWaveform(wrappers, waveforms.sinus(), 20);

    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch.resonance !== nextProps.patch.resonance
                || this.props.patch.mode !== nextProps.patch.mode
                || this.props.patch.wrapper !== nextProps.patch.wrapper
                || this.props.mixFunction !== nextProps.mixFunction;
    }

    componentWillUpdate (nextProps) {
        const {patch, mixFunction} = nextProps;
        const {wrapper, resonance} = patch;
        const {name, parameter} = wrapper;
        const wrapperFunction = wrappers[name];
        this.waveFunction = getWrapperFunction(wrapperFunction, mixFunction, resonance)(parameter);
    }

    render () {
        const {configuration, patch, handlers} = this.props;
        const {resonance, wrapper} = patch;

        return (
            <div className="oscillator-resonance-view">
                <WaveformCanvas
                    waveFunction={this.waveFunction}
                />
                <RangeInput
                    changeHandler={handlers.factorChange}
                    configuration={configuration}
                    label="Resonance"
                    value={resonance}
                />
                <WaveformSelector
                    handlers={handlers.wrapper}
                    module="oscillator"
                    patch={wrapper}
                    waveforms={this.wrappedWaveforms}
                />
            </div>
        );
    }
}


export default Resonance;
