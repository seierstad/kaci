import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import drawWaveform from "./draw-waveform";


class WaveformCanvas extends Component {

    static propTypes = {
        "update": PropTypes.bool,
        "waveFunction": PropTypes.func.isRequired
    }

    constructor (props) {
        super(props);
        this.animationFrame = null;
    }

    componentDidMount () {
        this.animationFrame = requestAnimationFrame(this.updateWaveform);
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.waveFunction !== this.props.waveFunction;
    }

    componentDidUpdate () {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.animationFrame = requestAnimationFrame(this.updateWaveform);
    }

    @autobind
    updateWaveform () {
        this.animationFrame = null;
        drawWaveform(this.props.waveFunction, this.waveform);
    }

    render () {
        return (
            <canvas ref={c => this.waveform = c} />
        );
    }
}


export default WaveformCanvas;
