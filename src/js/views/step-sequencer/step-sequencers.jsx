import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";


import {
    stepsPatchShape,
    modulationStepsSourcesConfigShape
} from "../../propdefs";
import StepSequencer from "./step-sequencer-view.jsx";

class StepSequencersView extends Component {

    static propTypes = {
        "configuration": modulationStepsSourcesConfigShape.isRequired,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "patch": PropTypes.arrayOf(stepsPatchShape).isRequired
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch
                || this.props.viewState !== nextProps.viewState;
    }

    render () {
        const {patch, configuration, handlers, viewState = []} = this.props;
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
                    viewState={viewState[i]}
                />
            );
        }

        return (
            <div>{generators}</div>
        );
    }
}


export default StepSequencersView;
