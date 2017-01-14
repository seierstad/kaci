import React, {Component, PropTypes} from "react";
import Connection from "./connection.jsx";

import {modulationTargetParameterShape} from "../../propdefs";


class ModulationTarget extends Component {
    render () {
        const {module, moduleParameterCount, patch = [], handlers, lfoCount, envCount, firstInModule, parameter} = this.props;

        const lfoPatch = patch.filter(p => p.source.type === "lfo").reduce((result, connection) => {result[connection.source.index] = connection; return result;}, []);
        const envPatch = patch.filter(p => p.source.type === "env").reduce((result, connection) => {result[connection.source.index] = connection; return result;}, []);

        const target = module + "." + parameter;
        const noEnvelope = !envPatch.some(env => env.enabled);


        const connections = [];

        for (let i = 0; i < lfoCount; i += 1) {
            connections.push(
                <Connection
                    handlers={handlers}
                    index={i}
                    key={"lfo" + i}
                    module={module}
                    parameter={parameter}
                    patch={lfoPatch[i]}
                    type="lfo"
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
                    patch={envPatch[i]}
                    type="env"
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
                        noConnection={noEnvelope}
                        parameter={parameter}
                        type="env"
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
    "patch": modulationTargetParameterShape
};

export default ModulationTarget;
