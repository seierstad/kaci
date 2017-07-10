import React, {Component} from "react"; import PropTypes from "prop-types";

import {syncConfigShape, syncPatchShape} from "../propdefs";

class FractionInput extends Component {

    static propTypes = {
        "children": PropTypes.any,
        "configuration": syncConfigShape.isRequired,
        "denominatorRef": PropTypes.func,
        "disabled": PropTypes.bool,
        "handlers": PropTypes.object.isRequired,
        "index": PropTypes.number,
        "legend": PropTypes.string,
        "module": PropTypes.string.isRequired,
        "numeratorRef": PropTypes.func,
        "patch": syncPatchShape.isRequired
    }

    constructor () {
        super();
        this.handleDenominatorChange = this.handleDenominatorChange.bind(this);
        this.handleNumeratorChange = this.handleNumeratorChange.bind(this);
    }

    handleToggle () {
        const {module, index, handlers, eventParams} = this.props;
        handlers.toggle(module, index, eventParams);
    }

    handleDenominatorChange (event) {
        event.preventDefault();
        const {module, index, handlers, eventParams} = this.props;
        const value = parseInt(event.target.value, 10);
        handlers.denominatorChange(value, module, index, eventParams);
    }

    handleNumeratorChange (event) {
        event.preventDefault();
        const {module, index, handlers, eventParams} = this.props;
        const value = parseInt(event.target.value, 10);
        handlers.numeratorChange(value, module, index, eventParams);
    }

    render () {
        const {patch, children, configuration, disabled, legend, className, numeratorRef, denominatorRef} = this.props;
        const {enabled, numerator, denominator} = patch;

        return (
            <fieldset
                className={className}
                disabled={disabled}
            >
                <legend>{legend || "fraction"}</legend>
                <div className={(className ? (className + "-") : "") + "flex-wrapper"}>
                    <input
                        disabled={!enabled}
                        max={configuration.numerator.max}
                        min={configuration.numerator.min}
                        onChange={this.handleNumeratorChange}
                        onInput={this.handleNumeratorChange}
                        ref={numeratorRef ? (n => numeratorRef(n)) : null}
                        type="number"
                        value={numerator}
                    />
                    <input
                        disabled={!enabled}
                        max={configuration.denominator.max}
                        min={configuration.denominator.min}
                        onChange={this.handleDenominatorChange}
                        onInput={this.handleDenominatorChange}
                        ref={denominatorRef ? (n => denominatorRef(n)) : null}
                        type="number"
                        value={denominator}
                    />
                    {children}
                </div>
            </fieldset>
        );
    }
}


export default FractionInput;
