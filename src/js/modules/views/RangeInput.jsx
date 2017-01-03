import {Component} from "react";
import React from "react";
let rangeInputId = 0;

class RangeInput extends Component {
    render () {
        const {min, max, step, value, disabled, label, changeHandler} = this.props;
        const id = "range_" + (rangeInputId += 1);
        return (
            <div>
                <input id={id} type="range" disabled={disabled} onInput={changeHandler} onChange={changeHandler} min={min} max={max} step={step} value={value} />
                <label htmlFor={id}>{label}</label>
            </div>
        );
    }
}

export default RangeInput;