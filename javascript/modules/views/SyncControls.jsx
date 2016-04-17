import React, {Component} from "react";

class SyncControls extends Component {
    render () {
        const {patch, configuration, enabled, onNumeratorChange, onDenominatorChange, onToggle} = this.props;

        return (
            <fieldset>
                <legend>sync</legend>
                <input 
                    type="checkbox" 
                    checked={!!patch.enabled} 
                    onChange={onToggle}
                />
                <input 
                    type="number"
                    disabled={!patch.enabled}
                    value={patch.numerator}
                    min={configuration.numerator.min}
                    max={configuration.numerator.max}
                    onInput={onNumeratorChange}
                    onChange={onNumeratorChange}
                />
                <input 
                    type="number"
                    disabled={!patch.enabled}
                    value={patch.denominator}
                    min={configuration.denominator.min}
                    max={configuration.denominator.max}
                    onInput={onDenominatorChange}
                    onChange={onDenominatorChange}
                />
            </fieldset>
        );
    }
}

export default SyncControls;
