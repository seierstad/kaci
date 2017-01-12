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
        this.props.changeHandler(parseFloat(this.input.value, 10));
    }

    render () {
        const {min, max, step, value, disabled, label} = this.props;
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
                    value={value}
                />
                <label htmlFor={id}>{label}</label>
            </div>
        );
    }
}
RangeInput.propTypes = {
    "changeHandler": PropTypes.func.isRequired,
    "disabled": PropTypes.bool,
    "label": PropTypes.string.isRequired,
    "max": PropTypes.number.isRequired,
    "min": PropTypes.number.isRequired,
    "step": PropTypes.number,
    "value": PropTypes.number.isRequired
};


export default RangeInput;
