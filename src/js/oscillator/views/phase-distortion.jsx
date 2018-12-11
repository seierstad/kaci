import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {EnvelopeConnected as Envelope} from "../../envelope/view/envelope.jsx";
import dispatchers from "../../envelope/dispatchers";
import drawWaveform from "./draw-waveform";


class PhaseDistortion extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "module": PropTypes.string.isRequired,
        "patch": PropTypes.object.isRequired,
        "subIndex": PropTypes.number.isRequired,
        "viewState": PropTypes.array,
        "waveFunction": PropTypes.func.isRequired,
        "waveformName": PropTypes.string.isRequired
    }

    constructor (props) {
        super(props);
        this.waveform = React.createRef();
    }

    componentDidMount () {
        this.updateWaveform();
    }

    shouldComponentUpdate (nextProps) {
        return (
            nextProps.waveformName !== this.props.waveformName
            || nextProps.patch !== this.props.patch
            || nextProps.viewState !== this.props.viewState
        );
    }

    componentDidUpdate () {
        this.updateWaveform();
    }

    updateWaveform () {
        drawWaveform(this.props.waveFunction, this.waveform.current);
    }


    render () {
        const {subIndex, handlers} = this.props;

        return (
            <div className="oscillator-pd-view">
                <canvas ref={this.waveform} />
                <Envelope
                    handlers={handlers}
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
