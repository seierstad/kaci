import React, {Component, PropTypes} from "react";

import {morseGeneratorsPatchShape, modulationMorseSourcesConfigShape} from "../../propdefs";
import MorseGenerator from "./morse-generator.jsx";

class MorseGenerators extends Component {

    static propTypes = {
        "configuration": modulationMorseSourcesConfigShape.isRequired,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "patch": morseGeneratorsPatchShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    render () {
        const {patch, configuration, handlers, syncHandlers} = this.props;
        let generators = [];

        for (let i = 0; i < configuration.count; i += 1) {
            generators.push(
                <MorseGenerator
                    configuration={configuration}
                    handlers={handlers}
                    includeSync={true}
                    index={i}
                    key={i}
                    patch={patch[i] || configuration["default"]}
                    syncHandlers={handlers.sync}
                />
            );
        }

        return <div>{generators}</div>;
    }
}


export default MorseGenerators;
