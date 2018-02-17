import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {defaultModulationConnectionParameters} from "../../configuration";
import {modulatorTypeShape, modulationConnectionPatchShape} from "../../propdefs";

import RangeInput from "../RangeInput.jsx";

import PolaritySelector from "./polarity-selector.jsx";


class Connection extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.func).isRequired,
        "index": PropTypes.number.isRequired,
        "noConnection": PropTypes.bool,
        "patch": modulationConnectionPatchShape,
        "path": PropTypes.arrayOf(PropTypes.string).isRequired,
        "type": modulatorTypeShape.isRequired
    }

    componentWillMount () {
        const {path, type, index} = this.props;
        this.path = [...path, type, index];
    }

    shouldComponentUpdate (nextProps) {
        return this.props.type === "env" || this.props.patch !== nextProps.patch;
    }

    @autobind
    amountChange (value) {
        this.props.handlers.changeAmount(...this.path, value);
    }

    @autobind
    polarityChange (value) {
        this.props.handlers.changePolarity(...this.path, value);
    }

    @autobind
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
        const isEnv = (type === "env");

        return (
            <td>
                <label htmlFor={id}>connect {type + " " + index + " to " + module + " " + parameter}</label>
                <input
                    checked={checked}
                    id={id}
                    name={isEnv ? name : null}
                    onChange={this.handleToggle}
                    type={isEnv ? "radio" : "checkbox"}
                />
                {index !== -1 ?
                    <PolaritySelector
                        changeHandler={this.polarityChange}
                        patch={polarity || "full"}
                        prefix={prefix}
                    />
                    :
                    null
                }
                {index !== -1 ?
                    <RangeInput
                        changeHandler={this.amountChange}
                        configuration={{max: 1, min: 0, step: 0.01}}
                        label="amount"
                        value={amount || 0}
                    />
                    :
                    null
                }
            </td>
        );
    }
}


export default Connection;
