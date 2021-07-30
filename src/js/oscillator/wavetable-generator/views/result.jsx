import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";
import { encodeWAV } from "wav-recorder-node";
import { waldorfBlofeldWavetable } from "../waldorf-blofeld.js";

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
                <a href={URL.createObjectURL(new Blob([encodeWAV([flattenWavetable(wavetable)], 44100, true)], {type: "audio/wav"}))} download="wavetable.wav">Download WAV</a>
                <a href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test21bits", 80)], {type: "application/midi"}))} download="wavetable21.syx">Download Waldorf Blofeld midi sysex 21bits</a>
                <a href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test20bits", 81)], {type: "application/midi"}))} download="wavetable20.syx">Download Waldorf Blofeld midi sysex 20bits</a>
                <a href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test19bits", 82)], {type: "application/midi"}))} download="wavetable19.syx">Download Waldorf Blofeld midi sysex 19bits</a>
                <a href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test18bits", 83)], {type: "application/midi"}))} download="wavetable18.syx">Download Waldorf Blofeld midi sysex 18bits</a>
                <a href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test17bits", 84)], {type: "application/midi"}))} download="wavetable17.syx">Download Waldorf Blofeld midi sysex 17bits</a>
                <a href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test16bits", 85)], {type: "application/midi"}))} download="wavetable16.syx">Download Waldorf Blofeld midi sysex 16bits</a>
                <a href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test15bits", 86)], {type: "application/midi"}))} download="wavetable15.syx">Download Waldorf Blofeld midi sysex 15bits</a>
                <a href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test14bits", 87)], {type: "application/midi"}))} download="wavetable14.syx">Download Waldorf Blofeld midi sysex 14bits</a>
                <a href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test13bits", 88)], {type: "application/midi"}))} download="wavetable13.syx">Download Waldorf Blofeld midi sysex 13bits</a>
                <a href={URL.createObjectURL(new Blob([waldorfBlofeldWavetable(null, flattenWavetable(wavetable), "test12bits", 89)], {type: "application/midi"}))} download="wavetable12.syx">Download Waldorf Blofeld midi sysex 12bits</a>
            </div>
        );
    }
}

export default Result;
