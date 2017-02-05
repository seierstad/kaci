import React, {Component, PropTypes} from "react";

import {waveforms, wrappers} from "../../waveforms";
import {oscillatorPatchDataShape, rangeShape} from "../../propdefs";

import DependentComponent from "../dependent-component.jsx";
import RangeInput from "../RangeInput.jsx";
import WaveformCanvas from "./waveform-canvas.jsx";
import WaveformSelector from "../WaveformSelector.jsx";


const getWrapperFunction = (wrapper, waveform, resonance) => (phase) => {
    return wrapper(phase) * waveform(phase * resonance);
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
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "mixFunction": PropTypes.func.isRequired,
        "patch": oscillatorPatchDataShape.isRequired
    }

    constructor () {
        super();
        this.waveFunction = () => 0;
        this.waveFunction = this.waveFunction.bind(this);
    }

    componentWillMount () {
        const {patch, mixFunction} = this.props;
        const {wrapper, resonance} = patch;
        let wrappedWaveforms = wrapWaveform(wrappers, waveforms.sinus, 5);
        this.setState({"wrappedWaveforms": wrappedWaveforms});
        this.waveFunction = getWrapperFunction(wrappers[wrapper], mixFunction, resonance);

    }

    shouldComponentUpdate (nextProps) {
        return (this.props.patch.resonance !== nextProps.patch.resonance) || (this.props.patch.wrapper !== nextProps.patch.wrapper) || (this.props.mixFunction !== nextProps.mixFunction);
    }

    componentWillUpdate (nextProps) {
        const {patch, mixFunction} = nextProps;
        const {wrapper, resonance} = patch;
        this.waveFunction = getWrapperFunction(wrappers[wrapper], mixFunction, resonance);
    }

    render () {
        const {configuration, patch, handlers} = this.props;
        const {resonance, resonanceActive, wrapper} = patch;

        return (
            <div className="oscillator-resonance-view">
                <WaveformCanvas waveFunction={this.waveFunction} />
                <input checked={resonanceActive} onChange={handlers.toggle} type="checkbox" />
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
                    waveforms={this.state.wrappedWaveforms}
                />
            </div>
        );
    }
}


export default Resonance;
