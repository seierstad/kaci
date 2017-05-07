import React, {Component, PropTypes} from "react";

import {modulationTargetParameterShape} from "../../propdefs";

import Connection from "./connection.jsx";


class ModulationTarget extends Component {

    static propTypes = {
        "envCount": PropTypes.number.isRequired,
        "handlers": PropTypes.object.isRequired,
        "lfoCount": PropTypes.number.isRequired,
        "moduleHead": PropTypes.object,
        "morseCount": PropTypes.number.isRequired,
        "parameter": PropTypes.string.isRequired,
        "patch": modulationTargetParameterShape,
        "path": PropTypes.arrayOf(PropTypes.string).isRequired
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    render () {
        const {moduleHead, patch = [], lfoCount, envCount, morseCount, parameter, path, ...rest} = this.props;

        const lfoPatch = patch.filter(p => p.source.type === "lfo").reduce((result, connection) => {result[connection.source.index] = connection; return result;}, []);
        const morsePatch = patch.filter(p => p.source.type === "morse").reduce((result, connection) => {result[connection.source.index] = connection; return result;}, []);
        const envPatch = patch.filter(p => p.source.type === "env").reduce((result, connection) => {result[connection.source.index] = connection; return result;}, []);
        const noEnvelope = !envPatch.some(env => env.enabled);


        const connections = [];

        for (let i = 0; i < lfoCount; i += 1) {
            connections.push(
                <Connection
                    {...rest}
                    index={i}
                    key={"lfo" + i}
                    patch={lfoPatch[i]}
                    path={[...path, parameter]}
                    type="lfo"
                />
            );
        }

        for (let i = 0; i < morseCount; i += 1) {
            connections.push(
                <Connection
                    {...rest}
                    index={i}
                    key={"morse" + i}
                    patch={morsePatch[i]}
                    path={[...path, parameter]}
                    type="morse"
                />
            );
        }

        for (let i = 0; i < envCount; i += 1) {
            connections.push(
                <Connection
                    {...rest}
                    index={i}
                    key={"env" + i}
                    patch={envPatch[i]}
                    path={[...path, parameter]}
                    type="env"
                />
            );
        }


        return (
            <tr>
                {moduleHead ?
                    <th rowSpan={moduleHead.parameterCount} scope="rowgroup"><span>{moduleHead.module}</span></th>
                : null }
                <th scope="row">{parameter}</th>
                {connections}
                {envCount > 0 ?
                    <Connection
                        {...rest}
                        index={-1}
                        key={envCount}
                        noConnection={noEnvelope}
                        path={[...path, parameter]}
                        type="env"
                    />
                : null}
            </tr>
        );
    }
}


export default ModulationTarget;
