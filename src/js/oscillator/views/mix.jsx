import React, {Component} from "react";
import PropTypes from "prop-types";

import {rangeShape} from "../../static-source/propdefs";
import RangeInput from "../../static-source/views/range-input.jsx";

import WaveformCanvas from "../../waveform/views/waveform-canvas.jsx";


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
