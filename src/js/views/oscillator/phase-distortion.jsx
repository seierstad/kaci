import React, {Component, PropTypes} from "react";

import drawWaveform from "../drawWaveform";

import Envelope from "../envelope/envelope.jsx";


class PhaseDistortion extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "index": PropTypes.number.isRequired,
        "module": PropTypes.string.isRequired,
        "patch": PropTypes.shape({
            "steps": PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number))
        }),
        "viewState": PropTypes.array,
        "waveFunction": PropTypes.func.isRequired,
        "waveformName": PropTypes.string.isRequired
    }

    componentDidMount () {
        this.updateWaveform();
    }

    shouldComponentUpdate (nextProps) {
        return (
            nextProps.waveformName !== this.props.waveformName
            || nextProps.patch.steps !== this.props.patch.steps
            || nextProps.viewState !== this.props.viewState
        );
    }

    componentDidUpdate () {
        this.updateWaveform();
    }

    updateWaveform () {
        drawWaveform(this.props.waveFunction, this.waveform);
    }


    render () {
        const {patch, viewState, index, module, handlers} = this.props;

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


export default PhaseDistortion;
