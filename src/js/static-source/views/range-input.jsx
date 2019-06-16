import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {getScale} from "../../shared-functions";


let rangeInputId = 0;

class RangeInput extends Component {

    static propTypes = {
        "centerLabel": PropTypes.string,
        "centerText": PropTypes.string,
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

    constructor (props) {
        super(props);
        this.input = React.createRef();
        this.animationRequest = null;
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
        const value = parseFloat(this.input.current.value, 10);

        if (this.animationRequest !== null) {
            cancelAnimationFrame(this.animationRequest);
        }

        this.animationRequest = requestAnimationFrame(() => {
            this.props.changeHandler(exponential ? this.scale.up(value) : value, eventParams);
            this.animationRequest = null;
        });

    }

    @autobind
    handleReset () {
        const {eventParams, configuration: {mid, exponential}} = this.props;
        this.props.changeHandler(exponential ? this.scale.up(mid) : mid, eventParams);
    }

    render () {
        const {centerText, centerLabel, className, configuration, value, disabled, label} = this.props;
        const {min, max, mid, step = 0.001, exponential} = configuration;

        const centerButton = (typeof mid === "number") ? (
            <button
                label={centerLabel || null}
                onClick={this.handleReset}
                type="button"
            >
                {centerText || "reset"}
            </button>
        ) : null;

        const input = (
            <input
                disabled={disabled}
                id={this.id}
                max={max}
                min={min}
                onChange={this.handleChange}
                ref={this.input}
                step={step}
                title={label}
                type="range"
                value={exponential ? this.scale.down(value) : value}
            />
        );

        const labelElement = <label htmlFor={this.id}>{label}</label>;

        if (className) {
            return (
                <div className={className}>
                    {centerButton}
                    {input}
                    {labelElement}
                </div>
            );
        }

        return (
            <React.Fragment>
                {centerButton}
                {input}
                {labelElement}
            </React.Fragment>
        );
    }
}


export default RangeInput;
