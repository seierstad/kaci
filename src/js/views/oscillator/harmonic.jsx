import React, {Component, PropTypes} from "react";

import {harmonicShape} from "../../propdefs";
import {harmonicConfiguration} from "../../configuration";
import {UNICODE_FRACTION, UNICODE_FRACTIONAL_SLASH, UNICODE_SUPERSCRIPT, UNICODE_SUBSCRIPT} from "../../constants";

import RangeInput from "../RangeInput.jsx";
import SyncControls from "../SyncControls.jsx";


class Harmonic extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "patch": harmonicShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    render () {
        const {
            configuration,
            patch,
            handlers
        } = this.props;

        const {
            [patch.numerator]: {
                [patch.denominator]: fraction
            } = {}
        } = UNICODE_FRACTION;

        const legend = fraction ? fraction : (
            [
                ...(Array.from(patch.numerator.toString(10))).map(digit => UNICODE_SUPERSCRIPT[digit]),
                UNICODE_FRACTIONAL_SLASH,
                ...(Array.from(patch.denominator.toString(10))).map(digit => UNICODE_SUBSCRIPT[digit])
            ].join("")
        );

        return (
            <SyncControls
                className="harmonic"
                configuration={harmonicConfiguration}
                eventParams={patch}
                handlers={handlers}
                legend={legend}
                module="oscillator"
                patch={patch}
            >
                <RangeInput
                    changeHandler={handlers.levelChange}
                    className="harmonic-level"
                    configuration={harmonicConfiguration.level}
                    eventParams={patch}
                    label="level"
                    value={patch.level}
                />
                <RangeInput
                    changeHandler={handlers.phaseChange}
                    className="harmonic-phase"
                    configuration={harmonicConfiguration.phase}
                    eventParams={patch}
                    label="phase"
                    value={patch.phase || 0}
                />

            </SyncControls>
        );
    }

}


export default Harmonic;
