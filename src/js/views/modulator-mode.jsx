import React, {Component, PropTypes} from "react";

import {modulatorPatchShape} from "../propdefs";

class ModulatorMode extends Component {

    static propTypes = {
        "handlers": PropTypes.shape({
            "modeChange": PropTypes.func.isRequired
        }).isRequired,
        "index": PropTypes.number,
        "module": PropTypes.string.isRequired,
        "patch": modulatorPatchShape.isRequired
    }

    constructor (props) {
        super(props);
        const {index, module} = this.props;
        this.handleModeChange = this.handleModeChange.bind(this, module, index);
    }

    handleModeChange (module, index, event) {
        event.stopPropagation();
        this.props.handlers.modeChange(event.target.value, module, index);
    }

    render () {
        const {patch, configuration} = this.props;

        return (
            <fieldset className="modulator mode">
                <legend>mode</legend>
                <label>
                    <input
                        checked={patch.mode === "voice" ? true : false}
                        onChange={this.handleModeChange}
                        type="radio"
                        value="voice"
                    />
                    voice
                </label>
                <label>
                    <input
                        checked={patch.mode === "global" ? true : false}
                        onChange={this.handleModeChange}
                        type="radio"
                        value="global"
                    />
                    global
                </label>
                <label>
                    <input
                        checked={patch.mode === "retrigger" ? true : false}
                        onChange={this.handleModeChange}
                        type="radio"
                        value="retrigger"
                    />
                    retrigger
                </label>
                <label>
                    <input
                        max="1"
                        min="0"
                        step="0.1"
                        type="range"
                    />
                    voice sync
                </label>
            </fieldset>
        );
    }
}


export default ModulatorMode;
