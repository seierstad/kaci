import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {harmonicShape} from "../propdefs";
import {harmonicConfiguration} from "../configuration";
import {
    UNICODE_FRACTION
} from "../../fraction/constants";

import Fraction from "../../fraction/views/fraction.jsx";
import RangeInput from "../../static-source/views/range-input.jsx";


class Harmonic extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "patch": harmonicShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    @autobind
    handleRemove () {
        const {module, index, handlers, patch} = this.props;
        handlers.remove(module, index, patch);
    }

    @autobind
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
                    {!(denominator === 1 && numerator === 1) ? (
                        <button
                            className="harmonic-remove"
                            onClick={this.handleRemove}
                            type="button"
                        >
                            remove
                        </button>
                    ) : null}
                    <input
                        checked={!!enabled}
                        className="harmonic-toggle"
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
