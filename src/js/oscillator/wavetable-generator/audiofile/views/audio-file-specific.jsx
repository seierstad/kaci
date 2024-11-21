import React, {Component, Fragment} from "react";
import PropTypes from "prop-types";

import * as DEFAULTS from "../defaults.js";
import WavSpecific from "../wav/views/wav.jsx";


class AudioFileSpecific extends Component {

    static propTypes = {
        viewState: PropTypes.object.isRequired
    }


    render () {
        const {
            viewState: {
                result: wavetable,
                model = DEFAULTS.MODEL
            }
        } = this.props;

        let ModelSpecificComponent;

        switch (model) {
            case "wav":
                ModelSpecificComponent = WavSpecific;
                break;

            default:
                ModelSpecificComponent = Fragment;
                break;
        }

        return (
            <React.Fragment>
                lydfil-spesifikt:
                <ModelSpecificComponent {...this.props}>
                    {this.props.children}
                </ModelSpecificComponent>
            </React.Fragment>
        );
    }
}

export default AudioFileSpecific;
