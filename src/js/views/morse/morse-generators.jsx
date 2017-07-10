import React, {Component} from "react"; import PropTypes from "prop-types";

import {morseGeneratorsPatchShape, modulationMorseSourcesConfigShape, morseGeneratorViewStateShape} from "../../propdefs";
import MorseGenerator from "./morse-generator.jsx";

class MorseGenerators extends Component {

    static propTypes = {
        "configuration": modulationMorseSourcesConfigShape.isRequired,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "patch": morseGeneratorsPatchShape.isRequired,
        "viewState": PropTypes.arrayOf(morseGeneratorViewStateShape)
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch
                || this.props.viewState !== nextProps.viewState;
    }

    render () {
        const {patch, configuration, handlers, syncHandlers, viewState = []} = this.props;
        let generators = [];

        for (let i = 0; i < configuration.count; i += 1) {
            generators.push(
                <MorseGenerator
                    configuration={configuration}
                    handlers={handlers}
                    includeSync={true}
                    index={i}
                    key={i}
                    module="morse"
                    patch={patch[i] || configuration["default"]}
                    syncHandlers={handlers.sync}
                    viewState={viewState[i]}
                />
            );
        }

        return <div>{generators}</div>;
    }
}


export default MorseGenerators;
