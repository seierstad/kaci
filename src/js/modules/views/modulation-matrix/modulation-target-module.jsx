import React, {Component, PropTypes} from "react";

import * as PropDef from "../../../proptype-defs";

import Target from "./modulation-target.jsx";

class ModulationTargetModule extends Component {
    render () {
        const {module, targetConfig, patch, lfoCount, envCount, handlers} = this.props;
        const parameters = Object.keys(targetConfig);
        return (
            <tbody>
                {parameters.map((parameter, index) => (
                    <Target
                        envCount={envCount}
                        firstInModule={index === 0}
                        handlers={handlers}
                        key={index}
                        lfoCount={lfoCount}
                        module={module}
                        moduleParameterCount={parameters.length}
                        parameter={parameter}
                        patch={patch}
                    />
                ))}
            </tbody>
        );
    }
}

ModulationTargetModule.propTypes = {
    "envCount": PropTypes.number.isRequired,
    "handlers": PropTypes.object,
    "lfoCount": PropTypes.number.isRequired,
    "module": PropTypes.string.isRequired,
    "patch": PropTypes.object,
    "targetConfig": PropDef.modulationTarget.isRequired
};

export default ModulationTargetModule;
