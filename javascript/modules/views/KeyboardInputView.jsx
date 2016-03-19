import React, { Component } from "react";
import { connect } from "react-redux";
import * as Actions from "../Actions.jsx";


class KeyboardInputViewPresentation extends Component {
    render () {
        const {layouts, activeLayout, onLayoutChange } = this.props;

        return (
            <fieldset className="keyboard-input-view">
                <select onChange={onLayoutChange} value={activeLayout}>
                    {layouts.map(layout => <option key={layout.name} value={layout.name}>{layout.name}</option>)}
                </select>
            </fieldset>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        activeLayout: state.settings.keyboard.activeLayout,
        layouts: state.settings.keyboard.layouts
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        onLayoutChange: (event) => {
            const value = event.target.value;

            dispatch({
                type: Actions.KEYBOARD_LAYOUT_CHANGE,
                value
            })
        }
    }
};
const KeyboardInputView = connect(
    mapStateToProps,
    mapDispatchToProps
)(KeyboardInputViewPresentation);

export default KeyboardInputView;