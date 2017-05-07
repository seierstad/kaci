import React, {Component, PropTypes} from "react";

import {syncConfigShape, syncPatchShape} from "../propdefs";

class SyncControls extends Component {

    static propTypes = {
        "configuration": syncConfigShape.isRequired,
        "disabled": PropTypes.bool,
        "handlers": PropTypes.object.isRequired,
        "index": PropTypes.number,
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
        const {module, index, handlers} = this.props;
        handlers.toggle(module, index);
    }

    handleDenominatorChange (event) {
        event.preventDefault();
        const {module, index, handlers} = this.props;
        const value = parseInt(event.target.value, 10);
        handlers.denominatorChange(value, module, index);
    }

    handleNumeratorChange (event) {
        event.preventDefault();
        const {module, index, handlers} = this.props;
        const value = parseInt(event.target.value, 10);
        handlers.numeratorChange(value, module, index);
    }

    render () {
        const {patch, configuration, disabled} = this.props;
        const {enabled, numerator, denominator} = patch;

        return (
            <fieldset
                disabled={disabled}
            >
                <legend>sync</legend>
                <input
                    checked={enabled}
                    onClick={this.handleToggle}
                    type="checkbox"
                />
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
            </fieldset>
        );
    }
}


export default SyncControls;
