import React, {Component, PropTypes} from "react";

import {modulationLfoSourcesSyncShape, syncPatchDataShape} from "../propdefs";

class SyncControls extends Component {

    constructor () {
        super();
        this.toggle = this.toggle.bind(this);
        this.denominatorChange = this.denominatorChange.bind(this);
        this.numeratorChange = this.numeratorChange.bind(this);
    }
    toggle (event) {
        const {module, index, handlers} = this.props;
        handlers.toggle(event, module, index);

    }
    denominatorChange (event) {
        const {module, index, handlers} = this.props;
        handlers.denominatorChange(event, module, index);
    }
    numeratorChange (event) {
        const {module, index, handlers} = this.props;
        handlers.numeratorChange(event, module, index);
    }

    render () {
        const {patch, configuration, handlers} = this.props;

        return (
            <fieldset>
                <legend>sync</legend>
                <input
                    checked={!!patch.enabled}
                    onChange={this.toggle}
                    type="checkbox"
                />
                <input
                    disabled={!patch.enabled}
                    max={configuration.numerator.max}
                    min={configuration.numerator.min}
                    onChange={this.numeratorChange}
                    onInput={this.numeratorChange}
                    type="number"
                    value={patch.numerator}
                />
                <input
                    disabled={!patch.enabled}
                    max={configuration.denominator.max}
                    min={configuration.denominator.min}
                    onChange={this.denominatorChange}
                    onInput={this.denominatorChange}
                    type="number"
                    value={patch.denominator}
                />
            </fieldset>
        );
    }
}
SyncControls.propTypes = {
    "configuration": modulationLfoSourcesSyncShape.isRequired,
    "handlers": PropTypes.object.isRequired,
    "index": PropTypes.number.isRequired,
    "module": PropTypes.string.isRequired,
    "patch": syncPatchDataShape.isRequired
};


export default SyncControls;
