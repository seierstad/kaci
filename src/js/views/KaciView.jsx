import React, {Component} from "react"; import PropTypes from "prop-types";
import {connect} from "react-redux";

import * as Actions from "../actions";
import {configurationShape, viewStateShape, playStateShape, patchShape} from "../propdefs";


import SystemSettingsView from "./SystemSettingsView.jsx";
import Patch from "./patch.jsx";
import Keyboard from "./keyboard/keyboard.jsx";


class KaciReactViewPresentation extends Component {

    static propTypes = {
        "configuration": configurationShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": patchShape.isRequired,
        "playState": playStateShape.isRequired,
        "viewState": viewStateShape.isRequired
    }

    render () {
        const {configuration, patch, handlers, viewState, playState} = this.props;
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
                    dispatch({type: Actions.KEYBOARD_LAYOUT_CHANGE, value});
                }
            },
            "systemReset": () => {
                dispatch({type: Actions.SYSTEM_RESET});
            }
        }
    };
};

const KaciReactView = connect(mapStateToProps, mapDispatchToProps)(KaciReactViewPresentation);


export default KaciReactView;
