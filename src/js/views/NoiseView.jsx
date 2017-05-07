import React, {Component, PropTypes} from "react";

import {modulationTargetShape, noisePatchShape} from "../propdefs";
import {noise} from "../waveforms";
import OutputStage from "./output-stage.jsx";

class NoiseView extends Component {

    static propTypes = {
        "configuration": modulationTargetShape.isRequired,
        "handlers": PropTypes.shape({
            "colorChange": PropTypes.func.isRequired
        }).isRequired,
        "patch": noisePatchShape.isRequired
    }

    constructor () {
        super();
        this.handleColorChange = this.handleColorChange.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.patch !== nextProps.patch);
    }

    handleColorChange (event) {
        event.stopPropagation();
        this.props.handlers.colorChange(event.target.value);
    }

    render () {
        const {patch, configuration, handlers} = this.props;
        const {outputHandlers} = handlers;
        const {color} = patch;

        return (
            <section className="noise-view">
                <h2>noise</h2>
                <select onChange={this.handleColorChange} value={patch.color}>
                    {Object.keys(noise).map(color => <option key={color}>{color}</option>)}
                </select>
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
