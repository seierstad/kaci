import React, {Component, PropTypes} from "react";

import {waveforms} from "../../waveforms";
import {harmonicShape, rangeShape} from "../../propdefs";
import {harmonicConfiguration} from "../../configuration";
import {UNICODE_FRACTION, UNICODE_FRACTIONAL_SLASH, UNICODE_SUPERSCRIPT, UNICODE_SUBSCRIPT} from "../../constants";

import RangeInput from "../RangeInput.jsx";
import SyncControls from "../SyncControls.jsx";
import WaveformCanvas from "./waveform-canvas.jsx";
import Harmonic from "./harmonic.jsx";


class Harmonics extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "mixFunction": PropTypes.func.isRequired,
        "patch": PropTypes.arrayOf(harmonicShape).isRequired
    }

    constructor (props) {
        super(props);
        this.waveFunction = () => 0;
        this.waveFunction = this.waveFunction.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch
                || this.props.mixFunction !== nextProps.mixFunction;
    }

    render () {
        const {
            configuration,
            patch,
            handlers
        } = this.props;

        return (
            <div>
                <output htmlFor="list of all harmonic inputs">
                    <WaveformCanvas waveFunction={this.waveFunction} />
                </output>

                <fieldset className="oscillator-harmonics-view">
                    <legend>harmonics</legend>

                    {patch.map(harmonic => (
                        <Harmonic
                            handlers={handlers}
                            key={harmonic.numerator + "_" + harmonic.denominator}
                            patch={harmonic}
                        >
                        </Harmonic>
                    ))}
                    {/*
                        button: new harmonic
                        harmonic edit fieldset
                            numerator
                            denominator
                            level
                            "add"-button (to enable the new harmonic)
                    */}
                    <button
                        onClick={handlers.handleNormalize}
                        type="button"
                    >normalize</button>
                </fieldset>
            </div>
        );
    }
}


export default Harmonics;
