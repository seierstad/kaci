import React, {Component, PropTypes} from "react";

import {modulationTargetShape, noisePatchDataShape} from "../propdefs";

import RangeInput from "./RangeInput.jsx";


class NoiseView extends Component {
    render () {
        const {patch, configuration, handlers} = this.props;
        const {panInput, gainInput, toggle} = handlers;
        const {active, gain, pan} = patch;

        return (
            <section className="noise-view">
                <h1>Noise</h1>
                <input checked={active} onChange={toggle} type="checkbox" />
                <RangeInput
                    changeHandler={gainInput}
                    label="Noise gain"
                    max={configuration.gain.max}
                    min={configuration.gain.min}
                    step={0.01}
                    value={gain}
                />
                <RangeInput
                    changeHandler={panInput}
                    label="Noise pan"
                    max={configuration.pan.max}
                    min={configuration.pan.min}
                    step={0.01}
                    value={pan}
                />
            </section>
        );
    }
}
NoiseView.propTypes = {
    "configuration": modulationTargetShape.isRequired,
    "handlers": PropTypes.object.isRequired,
    "patch": noisePatchDataShape.isRequired
};


export default NoiseView;
