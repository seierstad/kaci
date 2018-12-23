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

        const {
            handlers,
            module,
            subIndex
        } = this.props;

        this.boundHandlers = Object.entries(handlers).reduce((acc, [name, func]) => {
            acc[name] = func.bind(this, "oscillator", subIndex);
            return acc;
        }, {});
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
        const {subIndex, patch} = this.props;

        return (
            <div className="oscillator-pd-view">
                <canvas ref={this.waveform} />
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
