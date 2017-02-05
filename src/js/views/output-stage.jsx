import React, {Component, PropTypes} from "react";

import {outputTargetShape, patchOutputStageShape} from "../propdefs";

import RangeInput from "./RangeInput.jsx";


class OutputStage extends Component {

    static propTypes = {
        "configuration": outputTargetShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": patchOutputStageShape.isRequired
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
                <label className="module-active">
                    <input checked={active} onChange={handleToggle} type="checkbox" />
                    <span className="label-text">active</span>
                </label>
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
