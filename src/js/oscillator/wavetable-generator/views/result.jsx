import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";
import { encodeWAV } from "wav-recorder-node";
import { waldorfBlofeldWavetable, DEVICE_ID_BROADCAST } from "../waldorf-blofeld.js";

const shift = {
    x: 0.2,
    y: 0.3
};

const flattenWavetable = (wavetable = [[]]) => {
    const result = new Float32Array(wavetable.length * wavetable[0].length);
    wavetable.forEach((wave, index) => result.set(wave, index * wave.length));
    return result;
};

class Result extends Component {

    static propTypes = {
        "handlers": PropTypes.object.isRequired,
        "selected": PropTypes.number,
        "wavetable": PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired
    }

    scale (input) {
        return input * -50;
    }

    @autobind
    pathDataReducer (offset) {

        return (acc, curr, index, arr) => {
            switch (index) {
                case 0:
                    return `M0,${this.scale(0) + offset + 50}v${this.scale(curr)}`;
                case 1:
                    return `${acc}l1,${this.scale(curr - arr[index - 1])}`;
                case (arr.length - 1):
                    return `${acc} 1,${this.scale(curr - arr[index - 1])}v${this.scale(-curr)}`;
                default:
                    return `${acc} 1,${this.scale(curr - arr[index - 1])}`;
            }
        };
    }

    @autobind
    waveElement (wave, index, arr) {
        const offset = arr.length * shift.y;
        return (
            <path
                className={(index === this.props.selected) ? "selected" : null}
                d={wave.reduce(this.pathDataReducer(offset), "")}
                transform={`translate(${index * shift.x}, ${index * -shift.y})`}
            />
        );
    }

    render () {
        const {wavetable = []} = this.props;

        return (
            <div>
                <svg
                    className="wavetable-generator-result"
                    height="100%"
                    viewBox={`0 0 ${wavetable[0].length + Math.ceil(wavetable.length * shift.x)} ${100 + Math.ceil(shift.y * wavetable.length)}`}
                    width="100%"
                >
                    {wavetable.map(this.waveElement)}
                </svg>
                <a download="wavetable.wav" href={URL.createObjectURL(new Blob([encodeWAV([flattenWavetable(wavetable)], 44100, true)], {type: "audio/wav"}))}>Download WAV</a>
                <a download="wavetable21.syx" href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test21bits", 80, DEVICE_ID_BROADCAST)], {type: "application/midi"}))}>Download Waldorf Blofeld midi sysex</a>
            </div>
        );
    }
}

export default Result;
