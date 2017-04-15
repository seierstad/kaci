import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import {tuningShape} from "../propdefs";

import * as Actions from "../actions";


class TuningPresentation extends Component {

    static propTypes = {
        "configuration": tuningShape,
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired
    }

    constructor () {
        super();
        this.handleBaseFrequencyChange = this.handleBaseFrequencyChange.bind(this);
        this.handleScaleSelection = this.handleScaleSelection.bind(this);
        this.handleNoteCountChange = this.handleNoteCountChange.bind(this);
        this.handleBaseKey = this.handleBaseKey.bind(this);
        this.handleScaleTypeChange = this.handleScaleTypeChange.bind(this);
        this.handleScaleBaseChange = this.handleScaleBaseChange.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.configuration !== nextProps.configuration);
    }

    handleBaseFrequencyChange (event) {
        event.preventDefault();
        const {min, max} = this.props.configuration.baseFrequency;
        const value = parseInt(event.target.value, 10);
        if (value) {
            this.props.handlers.baseFrequency(Math.min(Math.max(value, min), max));
        }
    }

    handleNoteCountChange (event) {
        this.props.handlers.noteCount(parseInt(event.target.value, 10));
    }

    handleBaseKey (event) {
        this.props.handlers.baseKey(parseInt(event.target.value, 10));
    }

    handleScaleBaseChange (event) {
        this.props.handlers.scaleBase(parseFloat(event.target.value, 10));
    }

    handleScaleTypeChange (event) {
        this.props.handlers.scaleType(event.target.value);
    }

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
                            <span className="fraction" key={numerator + "-" + denominator}>{numerator}/{denominator} </span>
                        ))}
                    </fieldset>
                ) : null}
            </fieldset>
        );
    }
}


const mapDispatch = (dispatch) => ({
    "handlers": {
        "baseFrequency": (value) => {dispatch({type: Actions.BASE_FREQUENCY_CHANGE, value});},
        "baseKey": (value) => {dispatch({type: Actions.BASE_KEY_CHANGE, value});},
        "scaleBase": (value) => {dispatch({type: Actions.SCALE_BASE_CHANGE, value});},
        "scaleType": (value) => {dispatch({type: Actions.SCALE_TYPE_CHANGE, value});},
        "scaleFactor": (value) => {dispatch({type: Actions.SCALE_FACTOR_CHANGE, value});},
        "selectScale": (value) => {dispatch({type: Actions.TUNING_SELECT_SCALE, value});},
        "noteCount": (value) => {dispatch({type: Actions.SCALE_NOTE_COUNT_CHANGE, value});}
    }
});

const Tuning = connect(null, mapDispatch)(TuningPresentation);


export default Tuning;
