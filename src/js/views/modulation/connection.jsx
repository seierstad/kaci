import React, {Component, PropTypes} from "react";

import {defaultModulationConnectionParameters} from "../../configuration";
import {modulationSourceTypeShape, modulationConnectionPatchDataShape} from "../../propdefs";

import RangeInput from "../RangeInput.jsx";

import PolaritySelector from "./polarity-selector.jsx";


class Connection extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "index": PropTypes.number.isRequired,
        "noConnection": PropTypes.bool,
        "patch": modulationConnectionPatchDataShape,
        "path": PropTypes.arrayOf(PropTypes.string).isRequired,
        "type": modulationSourceTypeShape.isRequired
    }

    constructor () {
        super();
        this.amountChange = this.amountChange.bind(this);
        this.polarityChange = this.polarityChange.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    componentWillMount () {
        const {path, type, index} = this.props;
        this.path = [...path, type, index];
    }

    shouldComponentUpdate (nextProps) {
        return this.props.type === "env" || this.props.patch !== nextProps.patch;
    }

    amountChange (value) {
        this.props.handlers.changeAmount(...this.path, value);
    }

    polarityChange (value) {
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
                        changeHandler={this.polarityChange}
                        patch={polarity || "full"}
                        prefix={prefix}
                    />
                : null}
                {index !== -1 ?
                    <RangeInput
                        changeHandler={this.amountChange}
                        configuration={{max: 1, min: 0, step: 0.01}}
                        label="amount"
                        value={amount || 0}
                    />
                : null}
            </td>
        );
    }
}


export default Connection;
