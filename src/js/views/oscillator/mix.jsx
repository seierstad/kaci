import React, {Component, PropTypes} from "react";

import RangeInput from "../RangeInput.jsx";
import WaveformCanvas from "./waveform-canvas.jsx";
import DependentComponent from "../dependent-component.jsx";

class Mix extends Component {

    render () {
        const {changeHandler, configuration, patch, waveFunction} = this.props;

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

export default Mix;
