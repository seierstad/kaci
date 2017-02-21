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

    render () {
        const {configuration} = this.props;

        return (
            <fieldset className="tuning-view">
                <legend>tuning</legend>
                <label htmlFor="base-frequency">base</label>
                <input
                    id="base-frequency"
                    max={configuration.baseFrequency.max}
                    min={configuration.baseFrequency.min}
                    onChange={this.handleBaseFrequencyChange}
                    step={1}
                    type="number"
                    value={configuration.baseFrequency.value}
                />

                <label htmlFor="base-key">base key</label>
                <input
                    id="base-key"
                    max={configuration.baseKey.max}
                    min={configuration.baseKey.min}
                    step={1}
                    type="number"
                    value={configuration.baseKey.value}
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
        "baseFrequency": (value) => {dispatch({type: Actions.BASE_FREQUENCY_CHANGE, value});}
    }
});

const Tuning = connect(null, mapDispatch)(TuningPresentation);


export default Tuning;
