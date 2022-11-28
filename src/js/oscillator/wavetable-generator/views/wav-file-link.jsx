import React, {Component} from "react";
import PropTypes from "prop-types";
import { encodeWAV } from "wav-recorder-node";
import { flattenWavetable } from "../functions.js";


const wavBlob = (wavetable) => URL.createObjectURL(
    new Blob(
        [encodeWAV([flattenWavetable(wavetable)], 44100, true)],
        {type: "audio/wav"}
    )
);


class WavFileLink extends Component {

    static propTypes = {
        "name": PropTypes.string,
        "wavetable": PropTypes.arrayOf(PropTypes.object).isRequired // array of Float32Array (= object)
    }


    render () {
        const {
            name = "wavetable",
            wavetable
        } = this.props;

        return (
            <a download={`${name}.wav`} href={wavBlob(wavetable)}>Download WAV</a>
        );
    }
}

export default WavFileLink;
