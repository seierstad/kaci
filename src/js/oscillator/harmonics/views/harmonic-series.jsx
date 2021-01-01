import React, {Component} from "react";
import PropTypes from "prop-types";

import {harmonicSeriesShape} from "../propdefs";

import Harmonic from "./harmonic.jsx";
import Presets from "./presets.jsx";


class HarmonicSeries extends Component {

    static propTypes = {
        "handlers": PropTypes.shape({
            "handleNormalize": PropTypes.func.isRequired,
            "levelChange": PropTypes.func.isRequired,
            "phaseChange": PropTypes.func.isRequired,
            "toggle": PropTypes.func.isRequired
        }).isRequired,
        "index": PropTypes.number.isRequired,
        "patch": harmonicSeriesShape.isRequired,
        "viewState": PropTypes.object
    }

    render () {
        const {
            index,
            patch
        } = this.props;


        return (
            <fieldset className="oscillator-harmonic-series-view">
                <legend>harmonics</legend>

                <div className="flex-wrapper">
                    {patch.map((harmonic) => (
                        <Harmonic
                            handlers={this.props.handlers}
                            harmonicSeriesIndex={0}
                            index={index}
                            key={harmonic.numerator + "_" + harmonic.denominator}
                            patch={harmonic}
                        />
                    ))}
                    <button
                        className="harmonics-normalize"
                        onClick={this.props.handlers.handleNormalize}
                        type="button"
                    >normalize</button>
                </div>
                <Presets handlers={this.props.handlers} />
            </fieldset>
        );
    }
}


export default HarmonicSeries;
