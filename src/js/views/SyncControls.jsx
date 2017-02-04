import React, {Component, PropTypes} from "react";

import {modulationLfoSourcesSyncShape, syncPatchDataShape} from "../propdefs";

class SyncControls extends Component {

    constructor () {
        super();
        this.toggle = this.toggle.bind(this);
        this.denominatorChange = this.denominatorChange.bind(this);
        this.numeratorChange = this.numeratorChange.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return (nextProps.patch !== this.props.patch) || (nextProps["disabled"] !== this.props["disabled"]);
    }

    toggle () {
        const {module, index, handlers} = this.props;
        handlers.toggle(module, index);
    }

    denominatorChange (event) {
        event.preventDefault();
        const {module, index, handlers} = this.props;
        const value = parseInt(event.target.value, 10);
        handlers.denominatorChange(value, module, index);
    }

    numeratorChange (event) {
        event.preventDefault();
        const {module, index, handlers} = this.props;
        const value = parseInt(event.target.value, 10);
        handlers.numeratorChange(value, module, index);
    }

    render () {
        const {patch, configuration, handlers, disabled} = this.props;
        const {enabled, numerator, denominator} = patch;

        return (
            <fieldset
                disabled={disabled}
            >
                <legend>sync</legend>
                <input
                    checked={enabled}
                    onClick={this.toggle}
                    type="checkbox"
                />
                <input
                    disabled={!enabled}
                    max={configuration.numerator.max}
                    min={configuration.numerator.min}
                    onChange={this.numeratorChange}
                    onInput={this.numeratorChange}
                    type="number"
                    value={numerator}
                />
                <input
                    disabled={!enabled}
                    max={configuration.denominator.max}
                    min={configuration.denominator.min}
                    onChange={this.denominatorChange}
                    onInput={this.denominatorChange}
                    type="number"
                    value={denominator}
                />
            </fieldset>
        );
    }
}
SyncControls.propTypes = {
    "configuration": modulationLfoSourcesSyncShape.isRequired,
    "disabled": PropTypes.bool,
    "handlers": PropTypes.object.isRequired,
    "index": PropTypes.number,
    "module": PropTypes.string.isRequired,
    "patch": syncPatchDataShape.isRequired
};


export default SyncControls;
