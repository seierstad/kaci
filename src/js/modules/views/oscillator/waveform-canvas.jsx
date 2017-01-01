import React, {Component, PropTypes} from "react";

import drawWaveform from "../drawWaveform";

class WaveformCanvas extends Component {
    constructor () {
        super();
        this.updateWaveform = this.updateWaveform.bind(this);
    }

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
        return (
            <canvas ref={c => this.waveform = c} />
        );
    }
}
WaveformCanvas.propTypes = {
    "update": PropTypes.bool,
    "waveFunction": PropTypes.func.isRequired
};


export default WaveformCanvas;
