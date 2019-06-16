import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import OutputStage from "../../output-stage/views/output-stage.jsx";
import {modulationTargetShape} from "../../modulation/propdefs";
import {noisePatchShape} from "../propdefs";
import noise from "../noise";

class NoiseView extends Component {

    static propTypes = {
        "configuration": modulationTargetShape.isRequired,
        "handlers": PropTypes.shape({
            "colorChange": PropTypes.func.isRequired
        }).isRequired,
        "patch": noisePatchShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.patch !== nextProps.patch);
    }

    @autobind
    handleColorChange (event) {
        event.stopPropagation();
        this.props.handlers.colorChange(event.target.value);
    }

    render () {
        const {patch, configuration, handlers} = this.props;
        const {outputHandlers} = handlers;

        return (
            <section className="noise-view">
                <h1>noise</h1>
                <OutputStage
                    configuration={configuration}
                    handlers={outputHandlers}
                    patch={patch}
                />
                <label htmlFor="noise-color">color</label>
                <select id="noise-color" onChange={this.handleColorChange} value={patch.color}>
                    {Object.keys(noise).map(color => <option key={color}>{color}</option>)}
                </select>
            </section>
        );
    }
}


export default NoiseView;
