import React, {Component, PropTypes} from "react";

import {harmonicShape} from "../../propdefs";
import {harmonicConfiguration} from "../../configuration";
import {UNICODE_FRACTION, UNICODE_FRACTIONAL_SLASH, UNICODE_SUPERSCRIPT, UNICODE_SUBSCRIPT} from "../../constants";

import Fraction from "../fraction.jsx";
import RangeInput from "../RangeInput.jsx";
import SyncControls from "../SyncControls.jsx";


class Harmonic extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "patch": harmonicShape.isRequired
    }

    constructor (props) {
        super(props);

        this.handleToggle = this.handleToggle.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    handleToggle () {
        const {module, index, handlers, patch} = this.props;
        handlers.toggle(module, index, patch);
    }

    render () {
        const {
            configuration,
            patch,
            handlers
        } = this.props;

        const {
            enabled,
            numerator,
            denominator
        } = patch;

        const {
            [numerator]: {
                [denominator]: fraction
            } = {}
        } = UNICODE_FRACTION;

        const legend = <Fraction denominator={denominator} numerator={numerator} />;
        const toggleId = [numerator, denominator, "harmonic", "toggle"].join("-");

        return (
            <fieldset className="harmonic">
                <legend>{legend}</legend>
                <div className="flex-wrapper">
                    <input
                        checked={!!enabled}
                        id={toggleId}
                        onChange={this.handleToggle}
                        type="checkbox"
                    />
                    <label htmlFor={toggleId}>enabled</label>

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
                </div>
            </fieldset>
        );
    }

}


export default Harmonic;
