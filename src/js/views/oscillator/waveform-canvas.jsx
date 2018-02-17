import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import drawWaveform from "../drawWaveform";


class WaveformCanvas extends Component {

    static propTypes = {
        "update": PropTypes.bool,
        "waveFunction": PropTypes.func.isRequired
    }

    componentDidMount () {
        this.updateWaveform();
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.waveFunction !== this.props.waveFunction;
    }

    componentDidUpdate () {
        this.updateWaveform();
    }

    @autobind
    updateWaveform () {
        drawWaveform(this.props.waveFunction, this.waveform);
    }

    render () {
        return (
            <canvas ref={c => this.waveform = c} />
        );
    }
}


export default WaveformCanvas;
