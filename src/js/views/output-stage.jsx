import React, {Component} from "react"; import PropTypes from "prop-types";

import {outputTargetShape, outputStagePatchShape} from "../propdefs";

import ModuleToggle from "./module-toggle.jsx";
import RangeInput from "./RangeInput.jsx";


class OutputStage extends Component {

    static propTypes = {
        "configuration": outputTargetShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": outputStagePatchShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.patch !== nextProps.patch);
    }

    render () {
        const {patch, configuration, handlers} = this.props;
        const {active, gain, pan} = patch;
        const {handlePanInput, handleGainInput, handleToggle} = handlers;


        return (
            <fieldset>
                <legend>output</legend>
                <ModuleToggle
                    active={active}
                    handler={handleToggle}
                />
                <RangeInput
                    changeHandler={handleGainInput}
                    configuration={configuration.gain}
                    label="gain"
                    max={configuration.gain.max}
                    min={configuration.gain.min}
                    value={gain}
                />
                <RangeInput
                    changeHandler={handlePanInput}
                    configuration={configuration.pan}
                    label="pan"
                    value={pan}
                />
            </fieldset>
        );
    }
}


export default OutputStage;
