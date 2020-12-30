import React, {Component} from "react";
import PropTypes from "prop-types";
import {boundMethod} from "autobind-decorator";

import {modulatorPatchShape} from "../propdefs";

class ModulatorMode extends Component {

    static propTypes = {
        "handlers": PropTypes.shape({
            "modeChange": PropTypes.func.isRequired
        }).isRequired,
        "index": PropTypes.number,
        "patch": modulatorPatchShape.isRequired
    }

    @boundMethod
    handleModeChange (event) {
        const {handlers, index} = this.props;
        event.stopPropagation();
        handlers.modeChange(event.target.value, index);
    }

    render () {
        const {patch} = this.props;

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
                {
                /*
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
                */
                }
            </fieldset>
        );
    }
}


export default ModulatorMode;
