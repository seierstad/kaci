import React, {Component} from "react";
import PropTypes from "prop-types";
import WavFileLink from "./wav-file-link.jsx";


class AudioFileSpecific extends Component {

    static propTypes = {
        viewState: PropTypes.object.isRequired
    }


    render () {
        const {
            viewState: {
                result: wavetable
            }
        } = this.props;

        return (
            <React.Fragment>
                lydfil-spesifikt:
                {this.props.children}
                <WavFileLink wavetable={wavetable} />
            </React.Fragment>
        );
    }
}

export default AudioFileSpecific;
