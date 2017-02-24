import React, {Component, PropTypes} from "react";

import {modulatorConfigShape, modulatorPatchShape} from "../../propdefs";
import RangeInput from "../RangeInput.jsx";


const Modulator = Sup => class Modulator extends Sup {

    static propTypes = {
        "configuration": modulatorConfigShape.isRequired,
        "handlers": PropTypes.shape({
            "amountChange": PropTypes.func.isRequired,
            "reset": PropTypes.func.isRequired
        }).isRequired,
        "patch": modulatorPatchShape.isRequired
    }

    constructor (props) {
        super(props);
        this.handleReset = this.handleReset.bind(this);
        this.amountChange = this.amountChange.bind(this);
    }

    handleReset (event) {
        const {index, module, handlers} = this.props;
        handlers.reset(event, this.module, index);
    }

    amountChange (value) {
        const {index, handlers} = this.props;
        handlers.amountChange(value, this.module, index);
    }

    render () {
        const {patch, configuration, index, frequencyHandler, syncHandlers, includeSync} = this.props;

        return (
            <Sup {...this.props}>
                <RangeInput
                    changeHandler={this.amountChange}
                    configuration={configuration.amount}
                    label="amount"
                    value={patch.amount}
                />
                {this.props.children}
                <button onClick={this.handleReset}>reset</button>
            </Sup>
        );
    }
};


export default Modulator;
