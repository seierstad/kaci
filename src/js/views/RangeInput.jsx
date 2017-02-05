import {Component, PropTypes} from "react";
import React from "react";
let rangeInputId = 0;

const logBase = (x, base) => Math.log(x) / Math.log(base);

const getScale = (min, max, mid) => {

    if (typeof mid === "number") {
        const highOffset = 1 - mid;
        const highSpan = max - mid;

        const lowOffset = 1 - min;
        const lowSpan = mid - min;

        const down = (value) => {
            if (value >= mid) {
                return logBase(value - mid + 1, highSpan + 1) * highSpan + mid;
            }
            return logBase(mid - value + 1, lowSpan + 1) * -lowSpan - mid;
        };

        const up = (value) => {
            if (value >= mid) {
                return Math.pow(highSpan + 1, (value - mid) / highSpan) - 1 + mid;
            }
            return mid - (Math.pow(lowSpan + 1, (mid - value) / lowSpan) - 1);
        };

        return {up, down};
    }

    const span = max - min;
    const offset = 1 - min;
    const down = (value) => logBase(value - min + 1, span + 1) * span + min;
    const up = (value) => Math.pow(span + 1, (value - min) / span) + min - 1;

    return {up, down};
};

class RangeInput extends Component {

    static propTypes = {
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
    }

    constructor () {
        super();
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount () {
        const {configuration} = this.props;
        const {min, mid, max, exponential} = configuration;

        if (exponential) {
            this.scale = getScale(min, max, mid);
        }

        this.id = "range_" + (rangeInputId += 1);
    }

    shouldComponentUpdate (nextProps) {
        return this.props.value !== nextProps.value;
    }

    handleChange (event) {
        event.stopPropagation();
        event.preventDefault();
        const {exponential} = this.props.configuration;
        const value = parseFloat(this.input.value, 10);
        this.props.changeHandler(exponential ? this.scale.up(value) : value);
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
                    value={exponential ? this.scale.down(value) : value}
                />
                <label htmlFor={this.id}>{label}</label>
            </div>
        );
    }
}


export default RangeInput;


