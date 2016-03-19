import { Component } from "react";
import { connect } from "react-redux";

class KeyboardInputViewPresentation extends Component {
    render () {
        const {layouts, activeLayout, onSelectLayout } = this.props;

        return (
            <fieldset className="keyboard-input-view">
                <select onInput={onSelectLayout}>
                    layouts.map(layout => (<option selected={layout.name === activeLayout} value={layout.name}>{layout.name}</option>));
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
export default KeyboardInputView;