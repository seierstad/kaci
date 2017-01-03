import React, {Component, PropTypes} from "react";

import * as PropDefs from "../../../proptype-defs";

import PolaritySelector from "../polarity-selector.jsx";
import RangeInput from "../RangeInput.jsx";


class Connection extends Component {
    constructor () {
        super();
        this.amountChangeEnvelope = this.amountChangeEnvelope.bind(this);
        this.amountChangeLfo = this.amountChangeLfo.bind(this);
        this.polarityChangeEnvelope = this.polarityChangeEnvelope.bind(this);
        this.polarityChangeLfo = this.polarityChangeLfo.bind(this);
        this.toggleEnvelope = this.toggleEnvelope.bind(this);
        this.toggleLfo = this.toggleLfo.bind(this);
    }
    amountChangeEnvelope (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.amountChange(event, "envelope", index, module, parameter);
    }
    amountChangeLfo (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.amountChange(event, "lfo", index, module, parameter);
    }
    polarityChangeEnvelope (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.polarityChange(event, "envelope", index, module, parameter);
    }
    polarityChangeLfo (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.polarityChange(event, "lfo", index, module, parameter);
    }
    toggleEnvelope (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.toggle(event, "envelope", index, module, parameter);
    }
    toggleLfo (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.toggle(event, "lfo", index, module, parameter);
    }

    render () {
        const {type, index, module, parameter, patch, noConnection} = this.props;
        const prefix = [type, index, module, parameter].join("-");
        const id = prefix + "-connection";
        const target = module + "." + parameter;
        const checked = patch[type] &&
                        patch[type][index] &&
                        patch[type][index].hasOwnProperty(target) &&
                        patch[type][index][target].enabled
                        ||
                        index === null && noConnection;

        let polarity;
        let amount;
        let name = [type, module, parameter].join("-") + "-connection";

        polarity = patch && patch[type] && patch[type][index] && patch[type][index][target] && patch[type][index][target].polarity || "full";
        amount = patch && patch[type] && patch[type][index] && patch[type][index][target] && patch[type][index][target].amount || 0;

        const isLFO = type === "lfos";

        return (
            <td>
                <label htmlFor={id}>connect {type + " " + index + " to " + module + " " + parameter}</label>
                <input
                    checked={checked}
                    id={id}
                    name={isLFO ? null : name}
                    onChange={isLFO ? this.toggleLfo : this.toggleEnvelope}
                    type={isLFO ? "checkbox" : "radio"}
                />
                {index !== null ?
                    <PolaritySelector
                        changeHandler={isLFO ? this.polarityChangeLfo : this.polarityChangeEnvelope}
                        patch={polarity}
                        prefix={prefix}
                    />
                : null}
                {index !== null ?
                    <RangeInput
                        changeHandler={isLFO ? this.amountChangeLfo : this.amountChangeEnvelope}
                        label="amount"
                        max={1}
                        min={0}
                        step={0.01}
                        value={amount}
                    />
                : null}
            </td>
        );
    }
}
Connection.propTypes = {
    "handlers": PropTypes.object,
    "index": PropTypes.number.isRequired,
    "module": PropTypes.string.isRequired,
    "noConnection": PropTypes.bool,
    "parameter": PropTypes.string.isRequired,
    "patch": PropDefs.modulationPatchData.isRequired,
    "type": PropDefs.modulationSourceType.isRequired
};

export default Connection;
