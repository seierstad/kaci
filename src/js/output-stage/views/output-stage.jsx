import React, {Component} from "react";
import PropTypes from "prop-types";

import ModuleToggle from "../../views/module-toggle.jsx";
import RangeInput from "../../static-source/views/range-input.jsx";
import {outputTargetShape, outputStagePatchShape} from "../propdefs";


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
            <fieldset className="output">
                <legend>output</legend>
                <ModuleToggle
                    active={active}
                    handler={handleToggle}
                />
                <RangeInput
                    changeHandler={handleGainInput}
                    className="output-gain"
                    configuration={configuration.gain}
                    label="gain"
                    max={configuration.gain.max}
                    min={configuration.gain.min}
                    value={gain}
                />
                <RangeInput
                    centerLabel="center"
                    centerText="▶◀"
                    changeHandler={handlePanInput}
                    className="output-pan"
                    configuration={configuration.pan}
                    label="pan"
                    value={pan}
                />
            </fieldset>
        );
    }
}


export default OutputStage;
