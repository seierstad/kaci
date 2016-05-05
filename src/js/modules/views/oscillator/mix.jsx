import React, {Component, PropTypes} from "react";

import * as PropDefs from "../../proptype-defs";

import WaveformCanvas from "./waveform-canvas.jsx";
import RangeInput from "../RangeInput.jsx";


class Mix extends Component {
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
Mix.propTypes = {
    "changeHandler": PropTypes.func.isRequired,
    "configuration": PropDefs.inputRange,
    "patch": PropTypes.number.isRequired,
    "waveFunction": PropTypes.func.isRequired
};

export default Mix;