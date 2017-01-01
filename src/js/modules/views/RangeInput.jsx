import React, {Component, PropTypes} from "react";

let rangeInputId = 0;

class RangeInput extends Component {
    render () {
        const {min, max, step, value, disabled, label, changeHandler} = this.props;
        const id = "range_" + (rangeInputId += 1);
        return (
            <div>
                <input
                    disabled={disabled}
                    id={id}
                    max={max}
                    min={min}
                    onChange={changeHandler}
                    onInput={changeHandler}
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
