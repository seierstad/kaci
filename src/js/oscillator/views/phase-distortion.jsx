import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {EnvelopeConnected as Envelope} from "../../envelope/view/envelope.jsx";
import dispatchers from "../../envelope/dispatchers";
import drawWaveform from "../../waveform/views/draw-waveform";
import WaveformCanvas from "../../waveform/views/waveform-canvas.jsx";
import {waveformShape} from "../../waveform/propdefs";


class PhaseDistortion extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "patch": PropTypes.object.isRequired,
        "subIndex": PropTypes.number.isRequired,
        "viewState": PropTypes.array,
        "waveFunction": PropTypes.func.isRequired,
        "waveform": waveformShape.isRequired
    }

    constructor (props) {
        super(props);
        this.waveform = React.createRef();

        const {
            handlers,
            subIndex
        } = this.props;

        this.boundHandlers = Object.entries(handlers).reduce((acc, [name, func]) => {
            acc[name] = func.bind(this, "oscillator", subIndex);
            return acc;
        }, {});
    }

    /*
    componentDidMount () {
        this.updateWaveform();
    }
    */

    shouldComponentUpdate (nextProps) {
        return (
            nextProps.waveFunction !== this.props.waveFunction
            || nextProps.waveform !== this.props.waveform
            || nextProps.patch !== this.props.patch
            || nextProps.viewState !== this.props.viewState
        );
    }
    /*
    componentDidUpdate () {
        this.updateWaveform();
    }

    updateWaveform () {
        drawWaveform(this.props.waveFunction, this.waveform.current);
    }
    */

    render () {
        const {subIndex, patch} = this.props;

        return (
            <div className="oscillator-pd-view">
                <WaveformCanvas
                    waveFunction={this.props.waveFunction}
                />
                <Envelope
                    data={patch.steps}
                    handlers={this.boundHandlers}
                    module="oscillator"
                    part="pd"
                    subIndex={subIndex}
                />
            </div>
        );
    }
}

const PhaseDistortionConnected = connect(null, dispatchers)(PhaseDistortion);

export {
    PhaseDistortion
};

export default PhaseDistortionConnected;
