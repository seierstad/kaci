import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import {tuningShape} from "../propdefs";

import * as Actions from "../actions";


class TuningPresentation extends Component {
    constructor () {
        super();
        this.handleBaseFrequencyChange = this.handleBaseFrequencyChange.bind(this);
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
        const {configuration, handlers} = this.props;
        const {ports, selectedPort, channel} = configuration;

        return (
            <fieldset className="tuning-view">
                <legend>tuning</legend>
                <label htmlFor="base-frequency">base</label>
                <input
                    max={configuration.baseFrequency.max}
                    min={configuration.baseFrequency.min}
                    onChange={this.handleBaseFrequencyChange}
                    step={1}
                    type="number"
                    value={configuration.baseFrequency.value}
                />
            </fieldset>
        );
    }
}
TuningPresentation.propTypes = {
    "configuration": tuningShape,
    "handlers": PropTypes.objectOf(PropTypes.func).isRequired
};

const mapState = (state) => ({
    "configuration": state.settings.tuning
});

const mapDispatch = (dispatch) => ({
    "handlers": {
        "baseFrequency": (value) => {dispatch({type: Actions.BASE_FREQUENCY_CHANGE, value});}
    }
});

const Tuning = connect(mapState, mapDispatch)(TuningPresentation);

export default Tuning;
