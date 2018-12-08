import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {chordShiftPatchShape} from "../propdefs";

import {CHORD_SHIFT_MODE} from "../constants";


class ChordShiftModeView extends Component {

    static propTypes = {
        "changeHandler": PropTypes.func.isRequired,
        "patch": chordShiftPatchShape.isRequired
    }

    @autobind
    handleChangeMode (event) {
        event.stopPropagation();
        this.props.changeHandler(event.target.value);
    }

    render () {
        const {
            patch = {}
        } = this.props;

        return (
            <fieldset>
                <legend>Mode</legend>
                {Object.values(CHORD_SHIFT_MODE).map(mode => (
                    <label key={mode}>
                        <input
                            checked={patch.mode === mode}
                            id={"chord-shift-mode-" + mode}
                            name="chord-shift-mode-selector"
                            onChange={this.handleChangeMode}
                            type="radio"
                            value={mode}
                        />
                        <span className="label-text">{mode}</span>
                    </label>
                ))}
            </fieldset>
        );
    }
}


export default ChordShiftModeView;
