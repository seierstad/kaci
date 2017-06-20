import React, {Component, PropTypes} from "react";

import {waveforms} from "../../waveforms";
import {harmonicShape, rangeShape} from "../../propdefs";
import {harmonicConfiguration} from "../../configuration";
import {UNICODE_FRACTION, UNICODE_FRACTIONAL_SLASH, UNICODE_SUPERSCRIPT, UNICODE_SUBSCRIPT} from "../../constants";

import FractionInput from "../fraction-input.jsx";
import RangeInput from "../RangeInput.jsx";
import SyncControls from "../SyncControls.jsx";
import WaveformCanvas from "./waveform-canvas.jsx";
import Harmonic from "./harmonic.jsx";
import HarmonicNew from "./harmonic-new.jsx";


class Harmonics extends Component {

    static propTypes = {
        "handlers": PropTypes.shape({
            "add": PropTypes.func.isRequired,
            "denominatorChange": PropTypes.func.isRequired,
            "handleNormalize": PropTypes.func.isRequired,
            "handleNew": PropTypes.func.isRequired,
            "levelChange": PropTypes.func.isRequired,
            "numeratorChange": PropTypes.func.isRequired,
            "phaseChange": PropTypes.func.isRequired,
            "toggle": PropTypes.func.isRequired
        }).isRequired,
        "mixFunction": PropTypes.func.isRequired,
        "patch": PropTypes.arrayOf(harmonicShape).isRequired,
        "viewState": PropTypes.object
    }

    constructor (props) {
        super(props);
        this.waveFunction = () => 0;
        this.waveFunction = this.waveFunction.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch
                || this.props.mixFunction !== nextProps.mixFunction
                || this.viewState !== nextProps.viewState;
    }

    render () {
        const {
            configuration,
            patch,
            handlers,
            viewState: {
                newHarmonic = {}
            } = {}
        } = this.props;

        const {
            numerator: newNum,
            denominator: newDen
        } = newHarmonic;

        let identicalIndex = null;
        if (newHarmonic) {
            const newRatio = newNum / newDen;
            identicalIndex = patch.findIndex(h => ((h.numerator === newNum && h.denominator === newDen) || h.numerator / h.denominator === newRatio));
        }
        const newRatioIsUnique = (identicalIndex === -1);

        return (
            <div>
                <output htmlFor="list of all harmonic inputs">
                    <WaveformCanvas waveFunction={this.waveFunction} />
                </output>

                <fieldset className="oscillator-harmonics-view">
                    <legend>harmonics</legend>

                    {patch.map((harmonic, index) => (
                        <Harmonic
                            className={(index === identicalIndex) ? "same-as-new" : null}
                            handlers={handlers}
                            key={harmonic.numerator + "_" + harmonic.denominator}
                            patch={harmonic}
                        >
                        </Harmonic>
                    ))}
                    <button
                        onClick={handlers.handleNormalize}
                        type="button"
                    >normalize</button>
                </fieldset>
                    {(typeof newHarmonic.numerator === "number") ? (
                        <HarmonicNew
                            handlers={handlers}
                            validRatio={newRatioIsUnique}
                            viewState={newHarmonic}
                        />
                    ) : (
                        <button onClick={handlers.handleNew} type="button">new harmonic</button>
                    )}
            </div>
        );
    }
}


export default Harmonics;
