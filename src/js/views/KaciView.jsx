import React, {Component} from "react";
import {connect} from "react-redux";

import * as Actions from "../actions";

import SystemSettingsView from "./SystemSettingsView.jsx";
import Patch from "./patch.jsx";
import Keyboard from "./keyboard/keyboard.jsx";


class KaciReactViewPresentation extends Component {

    render () {
        const {configuration, patch, handlers, viewState, playState} = this.props;
        return (
            <div>
                <SystemSettingsView
                    keyboardConfiguration={configuration.keyboard}
                    keyboardHandlers={handlers.keyboard}
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
    configuration: state.settings,
    patch: state.patch,
    viewState: state.viewState,
    playState: state.playState

});
const mapDispatchToProps = (dispatch) => {
    return {
        handlers: {
            keyboard: {
                layoutChange: (event) => {
                    const value = event.target.value;
                    dispatch({type: Actions.KEYBOARD_LAYOUT_CHANGE, value});
                }
            },
            systemReset: () => {
                dispatch({type: Actions.SYSTEM_RESET});
            }
        }
    };
};
const KaciReactView = connect(
    mapStateToProps,
    mapDispatchToProps
)(KaciReactViewPresentation);


export default KaciReactView;
