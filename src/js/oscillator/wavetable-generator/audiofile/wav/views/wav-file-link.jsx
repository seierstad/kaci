import React, {Component} from "react";
import PropTypes from "prop-types";
import { encodeWAV } from "wav-recorder-node";


import * as DEFAULTS from "../defaults.js";

import { flattenWavetable } from "../../../functions.js";


const wavBlob = (wavetable, resolution, samplerate, float) => URL.createObjectURL(
    new Blob(
        [encodeWAV([flattenWavetable(wavetable)], samplerate, float, resolution)],
        {type: "audio/wav"}
    )
);


class WavFileLink extends Component {

    static propTypes = {
        "filename": PropTypes.string,
        "float": PropTypes.bool,
        "resolution": PropTypes.number,
        "samplerate": PropTypes.number,
        "wavetable": PropTypes.arrayOf(PropTypes.object).isRequired // array of Float32Array (= object)
    }


    render () {
        const {
            filename = DEFAULTS.FILENAME,
            float = DEFAULTS.FLOAT,
            samplerate = DEFAULTS.SAMPLERATE,
            resolution = DEFAULTS.RESOLUTION,
            wavetable
        } = this.props;

        return (
            <a download={`${filename}.wav`} href={wavBlob(wavetable, resolution, samplerate, float)}>Download WAV</a>
        );
    }
}

export default WavFileLink;
