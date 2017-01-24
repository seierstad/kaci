import {Component, PropTypes} from "react";
import React from "react";
let rangeInputId = 0;

class RangeInput extends Component {
    constructor () {
        super();
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange (event) {
        event.stopPropagation();
        event.preventDefault();
        const {exponential} = this.props;
        const value = parseFloat(this.input.value, 10);
        this.props.changeHandler(exponential ? (value < 0 ? -Math.exp(-value) : Math.exp(value)) : value);
    }

    render () {
        const {configuration, value, disabled, label} = this.props;
        const {min, max, step = 0.001, exponential} = configuration;
        const id = "range_" + (rangeInputId += 1);

        return (
            <div>
                <input
                    disabled={disabled}
                    id={id}
                    max={max}
                    min={min}
                    onChange={this.handleChange}
                    ref={i => this.input = i}
                    step={step}
                    type="range"
                    value={exponential ? (value < 0 ? -Math.log(-value) : Math.log(value)) : value}
                />
                <label htmlFor={id}>{label}</label>
            </div>
        );
    }
}
RangeInput.propTypes = {
    "changeHandler": PropTypes.func.isRequired,
    "configuration": PropTypes.shape({
        "exponential": PropTypes.bool,
        "max": PropTypes.number.isRequired,
        "min": PropTypes.number.isRequired,
        "step": PropTypes.number
    }),
    "disabled": PropTypes.bool,
    "label": PropTypes.string.isRequired,
    "value": PropTypes.number.isRequired
};


export default RangeInput;
