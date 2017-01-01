import React, {Component, PropTypes} from "react";

import drawWaveform from "./drawWaveform";
import * as PropDefs from "../../proptype-defs";

import Envelope from "../envelope/envelope.jsx";


class PhaseDistortion extends Component {
    componentDidMount () {
        this.updateWaveform();
    }

    componentDidUpdate () {
        this.updateWaveform();
    }

    updateWaveform () {
        drawWaveform(this.props.waveFunction, this.waveform);
    }

    render () {
        const {patch, viewState, index, handlers} = this.props;

        return (
            <div className="oscillator-pd-view">
                <canvas ref={c => this.waveform = c} />
                <Envelope
                    handlers={handlers}
                    index={index}
                    module="oscillator"
                    patch={patch}
                    viewState={viewState}
                />
            </div>
        );
    }
}
PhaseDistortion.propTypes = {
    "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
    "index": PropTypes.number.isRequired,
    "patch": PropDefs.oscillatorPdPatchData.isRequired,
    "viewState": PropTypes.array,
    "waveFunction": PropTypes.func.isRequired
};


export default PhaseDistortion;
