import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";
import Parameters from "./parameters.jsx";
import WavFileLink from "./wav-file-link.jsx";

class Wav extends Component {

    static propTypes = {
        "handlers": PropTypes.object.isRequired,
        "patch": PropTypes.object.isRequired,
        "viewState": PropTypes.object.isRequired
    }


    render () {
        const {
            viewState: {
                resolution,
                filename,
                samplerate,
                result: wavetable
            } = {}
        } = this.props;

        return (
            <Fragment>
                Wav-spesifikt her
                <Parameters {...this.props} />
                {this.props.children}
                <WavFileLink filename={filename} float={false} resolution={resolution} samplerate={samplerate} wavetable={wavetable} />
            </Fragment>
        );
    }
}

export default Wav;
