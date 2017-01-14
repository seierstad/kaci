import React, {Component, PropTypes} from "react";
import PolaritySelector from "./polarity-selector.jsx";
import RangeInput from "../RangeInput.jsx";
import {modulationSourceTypeShape, modulationPatchDataShape, modulationConnectionPatchDataShape} from "../../propdefs";

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
    amountChangeEnvelope (value) {
        const {handlers, index, module, parameter} = this.props;
        handlers.amountChange(value, "env", index, module, parameter);
    }
    amountChangeLfo (value) {
        const {handlers, index, module, parameter} = this.props;
        handlers.amountChange(value, "lfo", index, module, parameter);
    }
    polarityChangeEnvelope (value) {
        const {handlers, index, module, parameter} = this.props;
        handlers.polarityChange(value, "env", index, module, parameter);
    }
    polarityChangeLfo (event) {
        const {handlers, index, module, parameter} = this.props;
        handlers.polarityChange(event.target.value, "lfo", index, module, parameter);
    }
    toggleEnvelope () {
        const {handlers, index, module, parameter} = this.props;
        handlers.toggle("env", index, module, parameter);
    }
    toggleLfo () {
        const {handlers, index, module, parameter} = this.props;
        handlers.toggle("lfo", index, module, parameter);
    }

    render () {
        const {type, index, module, parameter, patch = {}, handlers, noConnection} = this.props;
        const prefix = [type, index, module, parameter].join("-");
        const id = prefix + "-connection";
        const target = module + "." + parameter;
        const checked = patch.enabled || (index === -1 && noConnection);

        const {polarity, amount} = patch;

        let name = [type, module, parameter].join("-") + "-connection";

        const isLFO = type === "lfo";

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
                {index !== -1 ?
                    <PolaritySelector
                        changeHandler={isLFO ? this.polarityChangeLfo : this.polarityChangeEnvelope}
                        patch={polarity || "full"}
                        prefix={prefix}
                    />
                : null}
                {index !== -1 ?
                    <RangeInput
                        changeHandler={isLFO ? this.amountChangeLfo : this.amountChangeEnvelope}
                        label="amount"
                        max={1}
                        min={0}
                        step={0.01}
                        value={amount || 0}
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
    "patch": modulationConnectionPatchDataShape,
    "type": modulationSourceTypeShape.isRequired
};


export default Connection;
