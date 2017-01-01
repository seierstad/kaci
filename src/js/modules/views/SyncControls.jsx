import React, {Component, PropTypes} from "react";

import * as PropDefs from "../../proptype-defs";


class SyncControls extends Component {

    constructor () {
        super();
        this.handleToggle = this.handleToggle.bind(this);
        this.handleDenominatorChange = this.handleDenominatorChange.bind(this);
        this.handleNumeratorChange = this.handleNumeratorChange.bind(this);
    }
    handleToggle (event) {
        const {module, index, handlers} = this.props;
        handlers.handleToggle(event, module, index);

    }
    handleDenominatorChange (event) {
        const {module, index, handlers} = this.props;
        handlers.handleDenominatorChange(event, module, index);
    }
    handleNumeratorChange (event) {
        const {module, index, handlers} = this.props;
        handlers.handleNumeratorChange(event, module, index);
    }

    render () {
        const {patch, configuration} = this.props;

        return (
            <fieldset>
                <legend>sync</legend>
                <input
                    checked={!!patch.enabled}
                    onChange={this.handleToggle}
                    type="checkbox"
                />
                <input
                    disabled={!patch.enabled}
                    max={configuration.numerator.max}
                    min={configuration.numerator.min}
                    onChange={this.handleNumeratorChange}
                    onInput={this.handleNumeratorChange}
                    type="number"
                    value={patch.numerator}
                />
                <input
                    disabled={!patch.enabled}
                    max={configuration.denominator.max}
                    min={configuration.denominator.min}
                    onChange={this.handleDenominatorChange}
                    onInput={this.handleDenominatorChange}
                    type="number"
                    value={patch.denominator}
                />
            </fieldset>
        );
    }
}
SyncControls.propTypes = {
    "configuration": PropDefs.modulationLfoSourcesSync.isRequired,
    "handlers": PropTypes.object.isRequired,
    "index": PropTypes.number.isRequired,
    "module": PropTypes.string.isRequired,
    "patch": PropDefs.syncPatchData.isRequired
};


export default SyncControls;
