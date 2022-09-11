import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import autobind from "autobind-decorator";

import {
    REFERENCE_KEY_CHANGE,
    REFERENCE_PITCH_CHANGE,
    SCALE_BASE_CHANGE,
    SCALE_NOTE_COUNT_CHANGE,
    SCALE_SELECT,
    SCALE_TYPE_CHANGE
} from "../actions";
import {tuningShape} from "../propdefs";

import Fraction from "../../fraction/views/fraction.jsx";


class TuningPresentation extends Component {

    static propTypes = {
        "configuration": tuningShape,
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.configuration !== nextProps.configuration);
    }

    @autobind
    handleBaseFrequencyChange (event) {
        event.preventDefault();
        const {min, max} = this.props.configuration.baseFrequency;
        const value = parseInt(event.target.value, 10);
        if (value) {
            this.props.handlers.baseFrequency(Math.min(Math.max(value, min), max));
        }
    }

    @autobind
    handleNoteCountChange (event) {
        this.props.handlers.noteCount(parseInt(event.target.value, 10));
    }

    @autobind
    handleBaseKey (event) {
        this.props.handlers.baseKey(parseInt(event.target.value, 10));
    }

    @autobind
    handleScaleBaseChange (event) {
        this.props.handlers.scaleBase(parseFloat(event.target.value, 10));
    }

    @autobind
    handleScaleTypeChange (event) {
        this.props.handlers.scaleType(event.target.value);
    }

    @autobind
    handleScaleSelection (event) {
        this.props.handlers.selectScale(event.target.value);
    }

    render () {
        const {configuration} = this.props;
        const {scales, scale, baseFrequency, keys, baseKey} = configuration;

        return (
            <fieldset className="tuning-view">
                <legend>tuning</legend>
                <label htmlFor="base-frequency">base</label>
                <input
                    id="base-frequency"
                    max={baseFrequency.max}
                    min={baseFrequency.min}
                    onChange={this.handleBaseFrequencyChange}
                    step={1}
                    type="number"
                    value={baseFrequency.value}
                />

                <select onChange={this.handleScaleSelection} value={scale.name}>
                    {scales.map(s => (
                        <option key={s.name}>{s.name}</option>
                    ))}
                </select>

                <label htmlFor="base-key">base key</label>
                <input
                    id="base-key"
                    max={keys.max}
                    min={keys.min}
                    onChange={this.handleBaseKey}
                    step={1}
                    type="number"
                    value={baseKey}
                />
                <label htmlFor="scale-type">type</label>
                <select
                    id="scale-type"
                    onChange={this.handleScaleTypeChange}
                    value={scale.type}
                >
                    <option>tempered</option>
                    <option>rational</option>
                </select>
                {scale.type === "tempered" ? (
                    <div>
                        <label htmlFor="number-of-notes">number of notes</label>
                        <input
                            id="number-of-notes"
                            max={128}
                            min={1}
                            onChange={this.handleNoteCountChange}
                            step={1}
                            type="number"
                            value={scale.notes}
                        />
                        <label htmlFor="scale-base">base</label>
                        <input
                            id="scale-base"
                            max={100}
                            min={1}
                            onChange={this.handleScaleBaseChange}
                            step={0.1}
                            type="number"
                            value={scale.base}
                        />
                    </div>
                ) : null}
                {scale.type === "rational" ? (
                    <fieldset>
                        <legend>ratios</legend>
                        {scale.ratios.map(([numerator, denominator]) => (
                            <Fraction
                                denominator={denominator}
                                key={numerator + "-" + denominator}
                                numerator={numerator}
                                vulgar
                            />
                        ))}
                    </fieldset>
                ) : null}
            </fieldset>
        );
    }
}


const mapDispatch = (dispatch) => ({
    "handlers": {
        "baseFrequency": (value) => {dispatch({type: REFERENCE_PITCH_CHANGE, value});},
        "baseKey": (value) => {dispatch({type: REFERENCE_KEY_CHANGE, value});},
        "scaleBase": (value) => {dispatch({type: SCALE_BASE_CHANGE, value});},
        "scaleType": (value) => {dispatch({type: SCALE_TYPE_CHANGE, value});},
        "selectScale": (value) => {dispatch({type: SCALE_SELECT, value});},
        "noteCount": (value) => {dispatch({type: SCALE_NOTE_COUNT_CHANGE, value});}
    }
});

const Tuning = connect(null, mapDispatch)(TuningPresentation);


export default Tuning;
