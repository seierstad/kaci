import React, {PureComponent} from "react";
import PropTypes from "prop-types";

import {stepsConfigShape, stepsPatchShape} from "../propdefs";
import StepSequencer from "./step-sequencer-view.jsx";

class StepSequencersView extends PureComponent {

    static propTypes = {
        "configuration": stepsConfigShape.isRequired,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "patch": PropTypes.arrayOf(stepsPatchShape).isRequired,
        "viewState": PropTypes.object.isRequired
    }

    render () {
        const {patch, configuration, handlers, viewState = {}} = this.props;
        const {
            instances: viewstateInstances = []
        } = viewState;
        let generators = [];

        for (let i = 0; i < configuration.count; i += 1) {
            generators.push(
                <StepSequencer
                    configuration={configuration}
                    handlers={handlers}
                    includeSync
                    index={i}
                    key={i}
                    module="steps"
                    patch={patch[i] || configuration["default"]}
                    syncHandlers={handlers.sync}
                    viewState={viewstateInstances[i]}
                />
            );
        }

        return (
            <div>{generators}</div>
        );
    }
}


export default StepSequencersView;
