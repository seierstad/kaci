import React from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import SyncControls from "../../sync/views/sync-controls.jsx";
import RangeInput from "../../static-source/views/range-input.jsx";

import {
    periodicModulatorConfigShape,
    periodicModulatorPatchShape
} from "../propdefs";

const Periodic = Sup => class Periodic extends Sup {

    static propTypes = {
        "configuration": periodicModulatorConfigShape.isRequired,
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
        const {index, handlers} = this.props;
        handlers.reset(event, this.module, index);
    }

    render () {
        const {patch, configuration, index, handlers, includeSync} = this.props;

        return (
            <Sup
                {...this.props}
            >
                <button onClick={this.handleReset}>reset</button>
                <fieldset>
                    <legend>speed</legend>
                    <RangeInput
                        changeHandler={this.frequencyChange}
                        configuration={configuration.speed.frequency}
                        disabled={includeSync && patch.speed.sync.enabled}
                        label="frequency"
                        value={patch.speed.frequency}
                    />
                    {includeSync ?
                        <SyncControls
                            configuration={configuration.speed.sync}
                            handlers={handlers.sync}
                            index={index}
                            module={this.module}
                            patch={patch.speed.sync}
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
