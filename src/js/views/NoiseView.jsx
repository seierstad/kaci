import React, {Component, PropTypes} from "react";

import {modulationTargetShape, noisePatchShape} from "../propdefs";
import OutputStage from "./output-stage.jsx";

class NoiseView extends Component {

    static propTypes = {
        "configuration": modulationTargetShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": noisePatchShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.patch !== nextProps.patch);
    }

    render () {
        const {patch, configuration, handlers} = this.props;
        const {outputHandlers} = handlers;
        const {color} = patch;

        return (
            <section className="noise-view">
                <h1>{color} noise</h1>
                <OutputStage
                    configuration={configuration}
                    handlers={outputHandlers}
                    patch={patch}
                />
            </section>
        );
    }
}


export default NoiseView;
