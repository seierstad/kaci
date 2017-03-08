import React, {Component, PropTypes} from "react";

import {modulatorPatchShape} from "../propdefs";

class ModulatorMode extends Component {

    static propTypes = {
        "handlers": PropTypes.shape({
            "colorChange": PropTypes.func.isRequired
        }).isRequired,
        "patch": modulatorPatchShape.isRequired
    }

    constructor () {
        super();
        this.handleModeChange = this.handleModeChange.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.patch !== nextProps.patch);
    }

    handleModeChange (event) {
        event.stopPropagation();
        this.props.handlers.modeChange(event.target.value);
    }

    render () {
        const {patch, configuration, handlers} = this.props;
        const {outputHandlers} = handlers;
        const {color} = patch;

        return (
            <fieldset className="modulator mode">
                <legend>mode</legend>
                <label><input type="radio" value="voice" />voice</label>
                <label><input type="radio" value="global" />global</label>
                <label><input type="radio" value="retrigger" />retrigger</label>
                <label><input max="1" min="0" step="0.1" type="range" />local sync factor</label>
            </fieldset>
        );
    }
}


export default ModulatorMode;
