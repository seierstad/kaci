import React, {Component} from "react";
import RangeInput from "./RangeInput.jsx";

class NoiseView extends Component {
    render () {
        const {patch, configuration, handlers} = this.props;
        const {panInput, gainInput, toggle} = handlers;
        const {active, gain, pan} = patch;

        return (
            <section className="noise-view">
                <h1>Noise</h1>
                <input type="checkbox" onChange={toggle} checked={active} />
                <RangeInput 
                    label="Noise gain" 
                    min={configuration.gain.min}
                    max={configuration.gain.max}
                    step={0.01}
                    changeHandler={gainInput}
                    value={gain} />
                <RangeInput 
                    label="Noise pan" 
                    min={configuration.pan.min}
                    max={configuration.pan.max}
                    step={0.01}
                    changeHandler={panInput}
                    value={pan} />
            </section>
        );
    }
}

module.exports = NoiseView;
