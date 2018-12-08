import React from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import SyncControls from "../../sync/views/sync-controls.jsx";
import RangeInput from "../../static-source/views/range-input.jsx";

import {
    periodicModulatorsConfigShape,
    periodicModulatorPatchShape
} from "../propdefs";

const Periodic = Sup => class Periodic extends Sup {

    static propTypes = {
        "configuration": periodicModulatorsConfigShape.isRequired,
        "handlers": PropTypes.shape({
            "frequencyChange": PropTypes.func.isRequired,
            "sync": PropTypes.objectOf(PropTypes.func).isRequired
        }),
        "includeSync": PropTypes.bool,
        "patch": periodicModulatorPatchShape.isRequired
    }

    constructor (props) {
        super(props);
    }

    componentDidMount () {
    }

    componentDidUpdate () {
    }

    @autobind
    frequencyChange (value) {
        const {index, handlers} = this.props;
        handlers.frequencyChange(value, this.module, index);
    }

    @autobind
    handleReset (event) {
        const {index, module, handlers} = this.props;
        handlers.reset(event, this.module, index);
    }

    render () {
        const {patch, configuration, index, handlers, syncHandlers, includeSync} = this.props;
        const {frequencyChange} = handlers;

        return (
            <Sup
                {...this.props}
            >
                <button onClick={this.handleReset}>reset</button>
                <fieldset>
                    <legend>speed</legend>
                    <RangeInput
                        changeHandler={this.frequencyChange}
                        configuration={configuration.frequency}
                        disabled={includeSync && patch.sync.enabled}
                        label="frequency"
                        value={patch.frequency}
                    />
                    {includeSync ?
                        <SyncControls
                            configuration={configuration.sync}
                            handlers={handlers.sync}
                            index={index}
                            module={this.module}
                            patch={patch.sync}
                        />
                        :
                        null
                    }
                </fieldset>
                {this.props.children}
            </Sup>
        );
    }
};


export default Periodic;
