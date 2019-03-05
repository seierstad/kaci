import React from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {modulatorConfigShape, modulatorPatchShape} from "../propdefs";
import RangeInput from "../../static-source/views/range-input.jsx";
import ModulatorMode from "./mode.jsx";

const Modulator = Sup => class Modulator extends Sup {

    static propTypes = {
        "configuration": modulatorConfigShape.isRequired,
        "handlers": PropTypes.shape({
            "amountChange": PropTypes.func.isRequired,
            "modeChange": PropTypes.func.isRequired,
            "reset": PropTypes.func.isRequired
        }).isRequired,
        "index": PropTypes.number,
        "module": PropTypes.string.isRequired,
        "patch": modulatorPatchShape.isRequired
    }

    constructor (props) {
        super(props);
    }

    componentDidMount () {
    }

    componentDidUpdate () {
    }

    @autobind
    amountChange (value) {
        const {index, handlers} = this.props;
        handlers.amountChange(value, this.module, index);
    }

    render () {
        const {
            patch,
            configuration
        } = this.props;

        return (
            <Sup {...this.props}>
                <ModulatorMode {...this.props} />
                <RangeInput
                    changeHandler={this.amountChange}
                    configuration={configuration.amount}
                    label="amount"
                    value={patch.amount}
                />
                {this.props.children}

            </Sup>
        );
    }
};


export default Modulator;
