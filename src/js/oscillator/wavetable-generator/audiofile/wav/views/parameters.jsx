import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import * as DEFAULTS from "../defaults.js";

class WavParameters extends Component {

    constructor (props) {
        super(props);
        this.samplerates = React.createRef();
    }

    static propTypes = {
        "handlers": PropTypes.object.isRequired,
        "patch": PropTypes.object.isRequired,
        "viewState": PropTypes.object.isRequired
    }

    @autobind
    handleResolution (event) {
        event.stopPropagation();
        this.props.handlers.audiofile.wav.changeResolution(parseInt(event.target.value), this.props.patch);
    }

    @autobind
    handleSamplerate (event) {
        event.stopPropagation();
        this.props.handlers.audiofile.wav.changeSamplerate(parseInt(event.target.value), this.props.patch);
    }

    @autobind
    handleFilename (event) {
        event.stopPropagation();
        this.props.handlers.audiofile.wav.changeFilename(event.target.value, this.props.patch);
    }

    render () {
        const {
            handlers,
            viewState: {
                filename = DEFAULTS.FILENAME,
                samplerate = DEFAULTS.SAMPLERATE,
                resolution = DEFAULTS.RESOLUTION
            }
        } = this.props;

        return (
            <fieldset>
                <legend>Wav parameters</legend>
                <label>
                    <span className="label-text">filename</span>
                    <input maxLength="128" onChange={this.handleFilename} placeholder={DEFAULTS.FILENAME} value={filename} />
                </label>
                <label>
                    <span className="label-text">samplerate</span>
                    <datalist id="wavetable-audiofile-samplerates" ref={this.samplerates}>
                        <option value={96000}>96kHz</option>
                        <option value={44100}>44.1kHz</option>
                        <option value={22050}>22.05kHz</option>
                        <option value={8000}>8kHz</option>
                    </datalist>
                    <input default={44100} list="wavetable-audiofile-samplerates" max="192000" min="128" onChange={this.handleSamplerate} placeholder={DEFAULTS.SAMPLERATE} type="number" value={samplerate} />
                </label>
                <label>
                    <span className="label-text">resolution</span>
                    <select onChange={this.handleResolution} value={resolution}>
                        <optgroup label="float">
                            <option value="32f">32 bits</option>
                        </optgroup>
                        <optgroup label="integer">
                            <option value={32}>32 bits</option>
                            <option value={24}>24 bits</option>
                            <option value={16}>16 bits</option>
                            <option value={12}>12 bits</option>
                            <option value={8}>8 bits</option>
                            <option value={7}>7 bits</option>
                            <option value={6}>6 bits</option>
                            <option value={5}>5 bits</option>
                            <option value={4}>4 bits</option>
                            <option value={3}>3 bits</option>
                            <option value={2}>2 bits</option>
                        </optgroup>
                    </select>
                </label>
            </fieldset>
        );
    }
}

export default WavParameters;

