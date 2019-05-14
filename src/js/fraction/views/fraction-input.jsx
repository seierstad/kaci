import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {syncConfigShape, syncPatchShape} from "../../speed/sync/propdefs";

class FractionInput extends Component {

    static propTypes = {
        "children": PropTypes.any,
        "className": PropTypes.string,
        "configuration": syncConfigShape.isRequired,
        "denominatorRef": PropTypes.func,
        "disabled": PropTypes.bool,
        "eventParams": PropTypes.object,
        "handlers": PropTypes.object.isRequired,
        "index": PropTypes.number,
        "legend": PropTypes.string,
        "module": PropTypes.string.isRequired,
        "numeratorRef": PropTypes.func,
        "patch": syncPatchShape.isRequired
    }

    @autobind
    handleToggle () {
        const {module, index, handlers, eventParams} = this.props;
        handlers.toggle(module, index, eventParams);
    }

    @autobind
    handleDenominatorChange (event) {
        event.preventDefault();
        const {module, index, handlers, eventParams} = this.props;
        const value = parseInt(event.target.value, 10);
        handlers.denominatorChange(value, module, index, eventParams);
    }

    @autobind
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
