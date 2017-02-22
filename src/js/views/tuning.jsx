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

    handleScaleSelection (event) {
        this.props.handlers.selectScale(event.target.value);
    }

    render () {
        const {configuration} = this.props;
        const {scales, selectedScale, baseFrequency, keys, baseKey} = configuration;

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

                <select onChange={this.handleScaleSelection} value={selectedScale}>
                    {scales.map(scale => (
                        <option key={scale.name}>{scale.name}</option>
                    ))}
                </select>

                <label htmlFor="base-key">base key</label>
                <input
                    id="base-key"
                    max={keys.max}
                    min={keys.min}
                    step={1}
                    type="number"
                    value={baseKey}
                />
                <select
                    id="tuning-mode"
                >
                    <option>tempered</option>
                    <option>rational</option>
                </select>
                <div>
                    <label htmlFor="number-of-notes">number of notes</label>
                    <input
                        id="number-of-notes"
                        max={100}
                        min={1}
                        step={1}
                        type="number"
                        value={12}
                    />
                    <label htmlFor="base-ratio">base ratio</label>
                    <input
                        id="base-ratio"
                        max={100}
                        min={1}
                        type="number"
                        value={2}
                    />
                </div>
            </fieldset>
        );
    }
}


const mapDispatch = (dispatch) => ({
    "handlers": {
        "baseFrequency": (value) => {dispatch({type: Actions.BASE_FREQUENCY_CHANGE, value});},
        "selectScale": (value) => {dispatch({type: Actions.TUNING_SELECT_SCALE, value});}
    }
});

const Tuning = connect(null, mapDispatch)(TuningPresentation);


export default Tuning;
