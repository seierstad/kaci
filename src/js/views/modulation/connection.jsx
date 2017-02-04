import React, {Component, PropTypes} from "react";
import PolaritySelector from "./polarity-selector.jsx";
import RangeInput from "../RangeInput.jsx";
import {modulationSourceTypeShape, modulationPatchDataShape, modulationConnectionPatchDataShape} from "../../propdefs";

import {defaultModulationConnectionParameters} from "../../configuration";


class Connection extends Component {
    constructor () {
        super();
        this.handleAmountChange = this.handleAmountChange.bind(this);
        this.handlePolarityChange = this.handlePolarityChange.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    componentWillMount () {
        const {path, type, index} = this.props;
        this.path = [...path, type, index];
    }

    shouldComponentUpdate (nextProps) {
        return this.props.type === "env" || this.props.patch !== nextProps.patch;
    }

    handleAmountChange (value) {
        this.props.handlers.changeAmount(...this.path, value);
    }

    handlePolarityChange (value) {
        this.props.handlers.changePolarity(...this.path, value);
    }

    handleToggle () {
        this.props.handlers.toggle(...this.path);
    }

    render () {
        const {type, index, patch = defaultModulationConnectionParameters, path, noConnection} = this.props;
        const {polarity, amount} = patch;
        const [module, parameter] = path;

        const prefix = [...path, type, index].join("-");
        const id = prefix + "-connection";
        const name = [type, module, parameter].join("-") + "-connection";

        const checked = patch.enabled || (index === -1 && noConnection);
        const isLFO = (type === "lfo");

        return (
            <td>
                <label htmlFor={id}>connect {type + " " + index + " to " + module + " " + parameter}</label>
                <input
                    checked={checked}
                    id={id}
                    name={isLFO ? null : name}
                    onChange={this.handleToggle}
                    type={isLFO ? "checkbox" : "radio"}
                />
                {index !== -1 ?
                    <PolaritySelector
                        changeHandler={this.handlePolarityChange}
                        patch={polarity || "full"}
                        prefix={prefix}
                    />
                : null}
                {index !== -1 ?
                    <RangeInput
                        changeHandler={this.handleAmountChange}
                        configuration={{max: 1, min: 0, step: 0.01}}
                        label="amount"
                        value={amount || 0}
                    />
                : null}
            </td>
        );
    }
}
Connection.propTypes = {
    "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
    "index": PropTypes.number.isRequired,
    "noConnection": PropTypes.bool,
    "patch": modulationConnectionPatchDataShape,
    "path": PropTypes.arrayOf(PropTypes.string).isRequired,
    "type": modulationSourceTypeShape.isRequired
};


export default Connection;
