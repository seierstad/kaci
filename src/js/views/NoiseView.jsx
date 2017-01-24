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
                    configuration={configuration.gain}
                    label="Noise gain"
                    max={configuration.gain.max}
                    min={configuration.gain.min}
                    value={gain}
                />
                <RangeInput
                    changeHandler={panInput}
                    configuration={configuration.pan}
                    label="Noise pan"
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
