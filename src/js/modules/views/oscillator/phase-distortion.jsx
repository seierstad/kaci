import React, {Component, PropTypes} from "react";

import drawWaveform from "../drawWaveform";
import * as PropDefs from "../../../proptype-defs";

import Envelope from "../envelope/envelope.jsx";


class PhaseDistortion extends Component {
    componentDidMount () {
        this.updateWaveform();
    }

    componentDidUpdate () {
        this.updateWaveform();
    }

    shouldComponentUpdate (nextProps, nextState) {
        return (
            nextProps.waveformName !== this.props.waveformName
            || nextProps.patch.steps !== this.props.patch.steps
            || nextProps.viewState !== this.props.viewState
        );
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
                    patch={patch.steps}
                    viewState={viewState}
                />
            </div>
        );
    }
}
PhaseDistortion.propTypes = {
    "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
    "index": PropTypes.number.isRequired,
    "patch": PropDefs.pdPatchData.isRequired,
    "viewState": PropTypes.array,
    "waveformName": PropTypes.string.isRequired,
    "waveFunction": PropTypes.func.isRequired
};


export default PhaseDistortion;
