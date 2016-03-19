import {Component} from "react";
import React from "react";
let rangeInputId = 0;

class RangeInput extends Component {
    render () {
    	const {min, max, step, value, label, onInput} = this.props;
    	const id = "range_" + (rangeInputId += 1);
        return (
        	<div>
	        	<input id={id} type="range" onInput={onInput} min={min} max={max} step={step} value={value} />
	        	<label htmlFor={id}>{label}</label>
        	</div>
        );
    }
}

export default RangeInput;