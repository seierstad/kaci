import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";

import {RESET as SYSTEM_RESET} from "../settings/actions";
import {playStateShape} from "../play-state/propdefs";
import {
    configurationShape,
    viewStateShape
} from "../propdefs";

import {patchShape} from "../patch/propdefs";
import {LAYOUT_CHANGE as KEYBOARD_LAYOUT_CHANGE} from "../keyboard/actions";
import SystemSettingsView from "../settings/settings.jsx";
import Patch from "../patch/views/patch.jsx";
import Keyboard from "../keyboard/views/keyboard.jsx";
import ChordShift from "../chord-shift/views/chord-shift.jsx";


class KaciReactViewPresentation extends Component {

    static propTypes = {
        /*
        "configuration": configurationShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": patchShape.isRequired,

        "playState": playStateShape.isRequired,
        "viewState": viewStateShape.isRequired
        */
    }

    render () {
        const {
            configuration = {},
            patch = {},
            handlers,
            viewState = {},
            playState = {}
        } = this.props;
        return (
            <div>
                <SystemSettingsView
                    configuration={configuration}
                    keyboardHandlers={handlers.keyboard}
                    playState={playState}
                    resetHandler={handlers.systemReset}
                />
                <Patch
                    configuration={configuration}
                    patch={patch}
                    viewState={viewState}
                />
                <ChordShift
                    patch={patch.chordShift}
                    playState={playState.chordShift}
                />
                <Keyboard />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    "configuration": state.settings,
    "patch": state.patch,
    "viewState": state.viewState,
    "playState": state.playState

});

const mapDispatchToProps = (dispatch) => {
    return {
        "handlers": {
            "keyboard": {
                "layoutChange": (event) => {
                    const value = event.target.value;
                    dispatch({type: KEYBOARD_LAYOUT_CHANGE, value});
                }
            },
            "systemReset": () => {
                dispatch({type: SYSTEM_RESET});
            }
        }
    };
};

const KaciReactView = connect(mapStateToProps, mapDispatchToProps)(KaciReactViewPresentation);


export default KaciReactView;
