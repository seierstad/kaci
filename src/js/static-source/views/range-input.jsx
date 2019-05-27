import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {getScale} from "../../shared-functions";


let rangeInputId = 0;

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

    @autobind
    handleChange (event) {
        event.stopPropagation();
        event.preventDefault();

        const {eventParams, configuration: {exponential}} = this.props;
        const value = parseFloat(this.input.value, 10);

        this.props.changeHandler(exponential ? this.scale.up(value) : value, eventParams);
    }

    @autobind
    handleReset () {
        const {eventParams, configuration: {mid, exponential}} = this.props;
        this.props.changeHandler(exponential ? this.scale.up(mid) : mid, eventParams);
    }

    render () {
        const {className, configuration, value, disabled, label} = this.props;
        const {min, max, mid, step = 0.001, exponential} = configuration;

        const centerButton = (typeof mid === "number") ? (
            <button onClick={this.handleReset} type="button">reset</button>
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
                    title={label}
                    type="range"
                    value={exponential ? this.scale.down(value) : value}
                />
                <label htmlFor={this.id}>{label}</label>
            </div>
        );
    }
}


export default RangeInput;
