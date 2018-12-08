import React, {Component} from "react"; import PropTypes from "prop-types";

import {modulationTargetShape, modulationTargetModuleShape} from "../propdefs";

import Target from "./target.jsx";


class ModulationTargetModule extends Component {

    static propTypes = {
        "configuration": modulationTargetShape.isRequired,
        "envCount": PropTypes.number.isRequired,
        "handlers": PropTypes.object,
        "lfoCount": PropTypes.number.isRequired,
        "module": PropTypes.string.isRequired,
        "morseCount": PropTypes.number.isRequired,
        "patch": modulationTargetModuleShape,
        "stepsCount": PropTypes.number.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    render () {
        const {module, configuration, patch = {}} = this.props;
        const parameters = Object.keys(configuration);

        return (
            <tbody>
                {parameters.map((parameter, index) => (
                    <Target
                        {...this.props}
                        key={index}
                        moduleHead={(index === 0) ? {module: module, parameterCount: parameters.length} : null}
                        parameter={parameter}
                        patch={patch[parameter]}
                        path={[module]}
                    />
                ))}
            </tbody>
        );
    }
}


export default ModulationTargetModule;
