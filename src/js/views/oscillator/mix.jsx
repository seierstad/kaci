import React, {Component, PropTypes} from "react";

import {rangeShape} from "../../propdefs";

import RangeInput from "../RangeInput.jsx";

import WaveformCanvas from "./waveform-canvas.jsx";


class Mix extends Component {

    static propTypes = {
        "changeHandler": PropTypes.func.isRequired,
        "configuration": rangeShape.isRequired,
        "patch": PropTypes.number.isRequired,
        "waveFunction": PropTypes.func.isRequired
    }

    render () {
        const {changeHandler, configuration, patch, waveFunction} = this.props;

        return (
            <div className="oscillator-mix-view">
                <WaveformCanvas waveFunction={waveFunction} />
                <RangeInput
                    changeHandler={changeHandler}
                    configuration={configuration}
                    label="Mix"
                    value={patch}
                />
            </div>
        );
    }
}

export default Mix;
