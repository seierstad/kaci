import React, {Component} from "react"; import PropTypes from "prop-types";

import {syncConfigShape, syncPatchShape} from "../propdefs";

class SyncControls extends Component {

    static propTypes = {
        "children": PropTypes.any,
        "configuration": syncConfigShape.isRequired,
        "disabled": PropTypes.bool,
        "handlers": PropTypes.object.isRequired,
        "index": PropTypes.number,
        "legend": PropTypes.string,
        "module": PropTypes.string.isRequired,
        "patch": syncPatchShape.isRequired
    }

    constructor () {
        super();
        this.handleToggle = this.handleToggle.bind(this);
        this.handleDenominatorChange = this.handleDenominatorChange.bind(this);
        this.handleNumeratorChange = this.handleNumeratorChange.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return (nextProps.patch !== this.props.patch) || (nextProps["disabled"] !== this.props["disabled"]);
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
        const {patch, children, configuration, disabled, legend, className} = this.props;
        const {enabled, numerator, denominator} = patch;

        return (
            <fieldset
                className={className}
                disabled={disabled}
            >
                <legend>{legend || "fraction"}</legend>
                <div className={(className ? (className + "-") : "") + "flex-wrapper"}>
                    <input
                        checked={!!enabled}
                        onChange={this.handleToggle}
                        type="checkbox"
                    />
                    {children}
                    <input
                        disabled={!enabled}
                        max={configuration.numerator.max}
                        min={configuration.numerator.min}
                        onChange={this.handleNumeratorChange}
                        onInput={this.handleNumeratorChange}
                        type="number"
                        value={numerator}
                    />
                    <input
                        disabled={!enabled}
                        max={configuration.denominator.max}
                        min={configuration.denominator.min}
                        onChange={this.handleDenominatorChange}
                        onInput={this.handleDenominatorChange}
                        type="number"
                        value={denominator}
                    />
                </div>
            </fieldset>
        );
    }
}


export default SyncControls;
