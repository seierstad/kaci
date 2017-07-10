import React, {Component} from "react"; import PropTypes from "prop-types";

import {waveforms} from "../../waveforms";
import {harmonicShape, rangeShape} from "../../propdefs";
import {harmonicConfiguration} from "../../configuration";

import {mixValues, phaseDistortionFunction, lcm, fractionsLcm} from "../../shared-functions";

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
        this.setWaveFunction = this.setWaveFunction.bind(this);
    }

    componentWillMount () {
        this.setWaveFunction(this.props);
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch
                || this.props.mixFunction !== nextProps.mixFunction
                || this.viewState !== nextProps.viewState;
    }

    componentWillUpdate (nextProps) {
        this.setWaveFunction(nextProps);
    }

    setWaveFunction (props) {
        const {patch, mixFunction} = props;
        const counter = fractionsLcm(patch);
        this.waveFunction = (phase) => patch.reduce((acc, harmonic) => {
            if (harmonic.enabled && harmonic.level > 0) {
                const p = ((phase * counter * harmonic.numerator / harmonic.denominator) + (harmonic.phase || 0)) % 1;
                const harmonicPhase = (p >= 0) ? p : (1 + p);
                return acc + mixFunction(harmonicPhase) * harmonic.level;
            }
            return acc;
        }, 0);
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
