import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

//import RangeInput from "../../../static-source/views/range-input.jsx";
import WaldorfSpecific from "../waldorf/views/waldorf-specific.jsx";
import AudioFileSpecific from "../audiofile/views/audio-file-specific.jsx";

import ViewstateToggle from "./viewstate-toggle.jsx";
import Parameters from "./parameters.jsx";
import Result from "./result.jsx";


class WavetableGenerator extends Component {

    static propTypes = {
        "configuration": PropTypes.object.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": PropTypes.object.isRequired,
        "viewState": PropTypes.object.isRequired
    }

    @autobind
    onToggle (event) {
        event.stopPropagation();
        const {
            waveform: {
                parameter: waveform
            } = {},
            harm_mix,
            pd_mix,
            wrapper: {
                parameter: wrapper
            } = {},
            resonance
        } = this.props.patch;

        const {
            waveform: {
                exponential: waveform_exp = false
            },
            harm_mix: {
                exponential: harm_mix_exp = false
            },
            pd_mix: {
                exponential: pd_mix_exp = false
            },
            wrapper: {
                exponential: wrapper_exp = false
            },
            resonance: {
                exponential: resonance_exp = false
            }
        } = this.props.configuration;


        const parameters = this.props.viewState.active ? (
            {}
        ) : (
            {
                "waveform": {
                    value: waveform,
                    change_rate: waveform_exp ? "exp" : "lin"
                },
                "harm_mix": {
                    value: harm_mix,
                    change_rate: harm_mix_exp ? "exp" : "lin"
                },
                "pd_mix": {
                    value: pd_mix,
                    change_rate: pd_mix_exp ? "exp" : "lin"
                },
                "wrapper": {
                    value: wrapper,
                    change_rate: wrapper_exp ? "exp" : "lin"
                },
                "resonance": {
                    value: resonance,
                    change_rate: resonance_exp ? "exp" : "lin"
                }
            }
        );


        this.props.handlers.toggle(parameters, this.props.patch);
    }

    @autobind
    handleTypeChange (event) {
        event.stopPropagation();
        this.props.handlers.changeType(event.target.value, this.props.patch);
    }

    @autobind
    handleWaveCountChange (event) {
        event.stopPropagation();
        this.props.handlers.changeWaveCount(Number.parseInt(event.target.value, 10), this.props.patch);
    }

    @autobind
    handleWaveLengthChange (event) {
        event.stopPropagation();
        this.props.handlers.changeWaveLength(Number.parseInt(event.target.value, 10), this.props.patch);
    }

    render () {
        const {configuration, handlers, patch, viewState} = this.props;
        const {
            active = false,
            manufacturer,
            model,
            result: wavetable,
            wave_count_locked = false,
            wave_length_locked = false,
            selected
        } = viewState;

        let ManufacturerSpecificComponent;

        switch (manufacturer) {
            case "waldorf":
                ManufacturerSpecificComponent = WaldorfSpecific;
                break;
            case "audiofile":
            default:
                ManufacturerSpecificComponent = AudioFileSpecific;
                break;
        }

        return (
            <fieldset className="wavetable-generator-wrapper">
                <legend>Wavetable generator</legend>
                <ViewstateToggle
                    active={active}
                    handler={this.onToggle}
                />
                {active && (
                    <div className="wavetable-generator-settings">
                        <label>
                            <span className="label-text">type</span>
                            <select onChange={this.handleTypeChange} value={viewState.type}>
                                <optgroup label="Generic">
                                    <option value="wav-audiofile">audio (WAV)</option>
                                </optgroup>
                                <optgroup label="Waldorf">
                                    <option value="blofeld-waldorf">Blofeld</option>
                                </optgroup>
                                <optgroup label="PPG" />
                            </select>
                        </label>
                        <div className="table-size">
                            <label>
                                <span className="label-text">wave count</span>
                                <input
                                    disabled={wave_count_locked}
                                    id="wavetable-wave-count"
                                    max="512"
                                    min="1"
                                    onChange={this.handleWaveCountChange}
                                    type="number"
                                    value={viewState.wave_count}
                                />
                            </label>
                            <label>
                                <span className="label-text">wave length</span>
                                <input
                                    disabled={wave_length_locked}
                                    id="wavetable-wave-length"
                                    max="1024"
                                    min="32"
                                    onChange={this.handleWaveLengthChange}
                                    type="number"
                                    value={viewState.wave_length}
                                />
                            </label>
                        </div>

                        <ManufacturerSpecificComponent {...this.props}>
                            <Parameters
                                configuration={configuration}
                                handlers={handlers}
                                patch={patch}
                                viewState={viewState}
                            />
                            <Result
                                handlers={handlers}
                                patch={patch}
                                selected={selected}
                                wavetable={wavetable}
                            />
                        </ManufacturerSpecificComponent>
                    </div>
                )}
            </fieldset>
        );
    }
}

export default WavetableGenerator;
