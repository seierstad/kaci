import React, {Component} from "react";

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
                    type="checkbox"
                    checked={!!patch.enabled}
                    onChange={this.toggle}
                />
                <input
                    type="number"
                    disabled={!patch.enabled}
                    value={patch.numerator}
                    min={configuration.numerator.min}
                    max={configuration.numerator.max}
                    onInput={this.numeratorChange}
                    onChange={this.numeratorChange}
                />
                <input
                    type="number"
                    disabled={!patch.enabled}
                    value={patch.denominator}
                    min={configuration.denominator.min}
                    max={configuration.denominator.max}
                    onInput={this.denominatorChange}
                    onChange={this.denominatorChange}
                />
            </fieldset>
        );
    }
}

export default SyncControls;
