import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {harmonicsShape} from "../propdefs";
import {fractionsLeastCommonIntegerMultiple, flipFraction, mixValues} from "../../shared-functions";

import WaveformCanvas from "../../waveform/views/waveform-canvas.jsx";
import Mix from "../../oscillator/views/mix.jsx";
import Harmonic from "./harmonic.jsx";
import HarmonicNew from "./harmonic-new.jsx";
import Presets from "./presets.jsx";


class Harmonics extends Component {

    static propTypes = {
        "configuration": PropTypes.shape({
            "harm_mix": PropTypes.object.isRequired
        }).isRequired,
        "handlers": PropTypes.shape({
            "add": PropTypes.func.isRequired,
            "denominatorChange": PropTypes.func.isRequired,
            "handleNormalize": PropTypes.func.isRequired,
            "handleNew": PropTypes.func.isRequired,
            "levelChange": PropTypes.func.isRequired,
            "mixChange": PropTypes.func.isRequired,
            "numeratorChange": PropTypes.func.isRequired,
            "phaseChange": PropTypes.func.isRequired,
            "toggle": PropTypes.func.isRequired
        }).isRequired,
        "mix": PropTypes.number.isRequired,
        "mixFunction": PropTypes.func.isRequired,
        "patch": harmonicsShape.isRequired,
        "viewState": PropTypes.object
    }

    constructor (props) {
        super(props);
        this.waveFunction = () => 0;
        this.handlers0 = {};
        this.handlers1 = {};
        Object.entries(props.handlers).forEach(([key, func]) => {
            if (key !== "mixChange") {
                this.handlers0[key] = func(0);
                this.handlers1[key] = func(1);
            }
        });
        this.mixChangeHandler = props.handlers.mixChange;
    }

    componentWillMount () {
        this.setWaveFunctions(this.props);
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch
                || this.props.mixFunction !== nextProps.mixFunction
                || this.viewState !== nextProps.viewState
                || this.props.mix !== nextProps.mix;
    }

    componentWillUpdate (nextProps) {
        this.setWaveFunctions(nextProps);
    }

    @autobind
    setWaveFunctions (props) {
        const {patch, mixFunction, mix} = props;
        const counter0 = fractionsLeastCommonIntegerMultiple(patch[0].map(flipFraction));
        this.wave0Function = (phase) => patch[0].reduce((acc, harmonic) => {
            if (harmonic.enabled && harmonic.level !== 0) {
                const p = ((phase * counter0 * harmonic.numerator / harmonic.denominator) + (harmonic.phase || 0)) % 1;
                const harmonicPhase = (p >= 0) ? p : (1 + p);
                return acc + mixFunction(harmonicPhase) * harmonic.level;
            }
            return acc;
        }, 0);
        const counter1 = fractionsLeastCommonIntegerMultiple(patch[1].map(flipFraction));
        this.wave1Function = (phase) => patch[1].reduce((acc, harmonic) => {
            if (harmonic.enabled && harmonic.level !== 0) {
                const p = ((phase * counter1 * harmonic.numerator / harmonic.denominator) + (harmonic.phase || 0)) % 1;
                const harmonicPhase = (p >= 0) ? p : (1 + p);
                return acc + mixFunction(harmonicPhase) * harmonic.level;
            }
            return acc;
        }, 0);
        this.waveMixFunction = (phase) => patch[0].reduce((acc, harmonic, index) => {
            const group2 = patch[1][index];
            if (harmonic.enabled && (harmonic.level !== 0 || group2.level !== 0)) {
                const p = ((phase * counter1 * harmonic.numerator / harmonic.denominator) + (mixValues(harmonic.phase, group2.phase, mix) || 0)) % 1;
                const harmonicPhase = (p >= 0) ? p : (1 + p);
                return acc + mixFunction(harmonicPhase) * mixValues(harmonic.level, group2.level, mix);
            }
            return acc;
        }, 0);
    }

    render () {
        const {
            configuration,
            mix,
            patch,
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
            identicalIndex = patch[0].findIndex(h => ((h.numerator === newNum && h.denominator === newDen) || h.numerator / h.denominator === newRatio));
        }
        const newRatioIsUnique = (identicalIndex === -1);

        return (
            <div>
                <output htmlFor="list of all harmonic inputs">
                    <WaveformCanvas waveFunction={this.wave0Function} />
                    <WaveformCanvas waveFunction={this.wave1Function} />
                </output>
                <Mix
                    changeHandler={this.mixChangeHandler}
                    configuration={configuration.harm_mix}
                    dependencies={{...patch, mix}}
                    patch={mix}
                    waveFunction={this.waveMixFunction}
                />
                <fieldset className="oscillator-harmonics-view">
                    <legend>harmonics</legend>

                    <div className="flex-wrapper">
                        {patch[0].map((harmonic, index) => (
                            <Harmonic
                                className={(index === identicalIndex) ? "same-as-new" : null}
                                handlers={this.handlers0}
                                key={harmonic.numerator + "_" + harmonic.denominator}
                                patch={harmonic}
                            />
                        ))}
                        {(typeof newHarmonic.numerator === "number") ? (
                            <HarmonicNew
                                handlers={this.handlers0}
                                validRatio={newRatioIsUnique}
                                viewState={newHarmonic}
                            />
                        ) : (
                            <button className="harmonics-add" onClick={this.handlers0.handleNew} title="add harmonic" type="button">add</button>
                        )}
                        <button
                            className="harmonics-normalize"
                            onClick={this.handlers0.handleNormalize}
                            type="button"
                        >normalize</button>
                    </div>
                    <Presets handlers={this.handlers0} />
                </fieldset>
                <fieldset className="oscillator-harmonics-view">
                    <legend>harmonics</legend>

                    <div className="flex-wrapper">
                        {patch[1].map((harmonic, index) => (
                            <Harmonic
                                className={(index === identicalIndex) ? "same-as-new" : null}
                                handlers={this.handlers1}
                                key={harmonic.numerator + "_" + harmonic.denominator}
                                patch={harmonic}
                            />
                        ))}
                        <button
                            className="harmonics-normalize"
                            onClick={this.handlers1.handleNormalize}
                            type="button"
                        >normalize</button>
                    </div>
                    <Presets handlers={this.handlers1} />
                </fieldset>
            </div>
        );
    }
}


export default Harmonics;
