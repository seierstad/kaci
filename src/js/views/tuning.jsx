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


const mapDispatch = (dispatch) => ({
    "handlers": {
        "baseFrequency": (value) => {dispatch({type: Actions.BASE_FREQUENCY_CHANGE, value});}
    }
});

const Tuning = connect(null, mapDispatch)(TuningPresentation);


export default Tuning;
