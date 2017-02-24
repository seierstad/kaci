import React, {Component, PropTypes} from "react";

import {modulationTargetShape, mainOutPatchShape} from "../propdefs";
import OutputStage from "./output-stage.jsx";

class MainOutput extends Component {

    static propTypes = {
        "configuration": modulationTargetShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": mainOutPatchShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.patch !== nextProps.patch);
    }

    render () {
        const {patch, configuration, handlers} = this.props;
        const {outputHandlers} = handlers;

        return (
            <section className="main-output-view">
                <h1>main output</h1>
                <OutputStage
                    configuration={configuration}
                    handlers={outputHandlers}
                    patch={patch}
                />
            </section>
        );
    }
}


export default MainOutput;
