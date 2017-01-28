import {Component, PropTypes} from "react";
import React from "react";
let rangeInputId = 0;

const fullLog = (number) => number < 0 ? -Math.log(-number) : Math.log(number);
const fullExp = (number) => number < 0 ? -Math.exp(-number) : Math.exp(number);

const logBase = (x, base) => Math.log(x) / Math.log(base);

const getDownScale = (min, max) => (value) => {
    const span = max - min;
    return Math.pow(span + 1, (value - min)/span) + min - 1;
};


const getUpScale = (min, max) => (value) => {
    const span = max - min;
    const offset = 1 - min;
    return logBase(value - min + 1, span + 1) * span + min;
};

class RangeInput extends Component {
    constructor () {
        super();
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount () {
        const {configuration} = this.props;
        const {min, max, exponential} = configuration;

        this.downScale = getDownScale(min, max);
        this.upScale = getUpScale(min, max);

        this.id = "range_" + (rangeInputId += 1);
    }


    handleChange (event) {
        event.stopPropagation();
        event.preventDefault();
        const {exponential} = this.props.configuration;
        const value = parseFloat(this.input.value, 10);
        this.props.changeHandler(exponential ? this.downScale(value) : value);
    }

    render () {
        const {configuration, value, disabled, label} = this.props;
        const {min, max, step = 0.001, exponential} = configuration;


        return (
            <div>
                <input
                    disabled={disabled}
                    id={this.id}
                    max={max}
                    min={min}
                    onChange={this.handleChange}
                    ref={i => this.input = i}
                    step={step}
                    type="range"
                    value={exponential ? this.upScale(value) : value}
                />
                <label htmlFor={this.id}>{label}</label>
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


