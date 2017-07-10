import React, {Component} from "react"; import PropTypes from "prop-types";


let rangeInputId = 0;

const logBase = (x, base) => Math.log(x) / Math.log(base);

const getScale = (min, max, mid) => {

    if (typeof mid === "number") {
        const highSpan = max - mid;
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
    const down = (value) => logBase(value - min + 1, span + 1) * span + min;
    const up = (value) => Math.pow(span + 1, (value - min) / span) + min - 1;

    return {up, down};
};

class RangeInput extends Component {

    static propTypes = {
        "changeHandler": PropTypes.func.isRequired,
        "className": PropTypes.string,
        "configuration": PropTypes.shape({
            "exponential": PropTypes.bool,
            "max": PropTypes.number.isRequired,
            "mid": PropTypes.number,
            "min": PropTypes.number.isRequired,
            "step": PropTypes.number
        }),
        "disabled": PropTypes.bool,
        "eventParams": PropTypes.object,
        "label": PropTypes.string.isRequired,
        "value": PropTypes.number.isRequired
    }

    constructor () {
        super();
        this.handleChange = this.handleChange.bind(this);
        this.handleReset = this.handleReset.bind(this);
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

        const {eventParams, configuration: {exponential}} = this.props;
        const value = parseFloat(this.input.value, 10);

        this.props.changeHandler(exponential ? this.scale.up(value) : value, eventParams);
    }

    handleReset () {
        const {eventParams, configuration: {mid, exponential}} = this.props;
        this.props.changeHandler(exponential ? this.scale.up(mid) : mid, eventParams);
    }

    render () {
        const {className, configuration, value, disabled, label} = this.props;
        const {min, max, mid, step = 0.001, exponential} = configuration;

        const centerButton = (typeof mid === "number") ? (
            <button onClick={this.handleReset}>reset</button>
        ) : null;

        return (
            <div className={className ? className : null}>
                {centerButton}
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
