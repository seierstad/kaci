import React, {Component, PropTypes} from "react";

import * as PropDefs from "../../../proptype-defs";

import Connection from "./modulation-connection.jsx";


class ModulationTarget extends Component {
    render () {
        const {module, moduleParameterCount, patch, handlers, lfoCount, envCount, firstInModule, parameter} = this.props;

        const target = module + "." + parameter;
        const noConnection = !patch["envelopes"] ||
                             !patch["envelopes"].some(env => env.hasOwnProperty(target) && env[target].enabled);

        const connections = [];

        for (let i = 0; i < lfoCount; i += 1) {
            connections.push(
                <Connection
                    handlers={handlers}
                    index={i}
                    key={"lfo" + i}
                    module={module}
                    parameter={parameter}
                    patch={patch}
                    type="lfos"
                />
            );
        }

        for (let i = 0; i < envCount; i += 1) {
            connections.push(
                <Connection
                    handlers={handlers}
                    index={i}
                    key={"env" + i}
                    module={module}
                    parameter={parameter}
                    patch={patch}
                    type="envelopes"
                />
            );
        }

        return (
            <tr>
                {firstInModule ?
                    <th rowSpan={moduleParameterCount} scope="rowgroup"><span>{module}</span></th>
                : null }
                <th scope="row">{parameter}</th>
                {connections}
                {envCount > 0 ?
                    <Connection
                        handlers={handlers}
                        index={-1}
                        key={envCount}
                        module={module}
                        noConnection={noConnection}
                        parameter={parameter}
                        patch={patch}
                        type="envelopes"
                    />
                : null}
            </tr>
        );
    }
}
ModulationTarget.propTypes = {
    "envCount": PropTypes.number,
    "firstInModule": PropTypes.bool.isRequired,
    "handlers": PropTypes.object.isRequired,
    "lfoCount": PropTypes.number,
    "module": PropTypes.string.isRequired,
    "moduleParameterCount": PropTypes.number,
    "parameter": PropTypes.string.isRequired,
    "patch": PropDefs.modulationPatchData.isRequired
};

export default ModulationTarget;
