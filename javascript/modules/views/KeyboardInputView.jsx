import React, { Component } from "react";
import { connect } from "react-redux";
import * as Actions from "../Actions.jsx";


class KeyboardInputView extends Component {
    render () {
        const {configuration, handlers} = this.props;
        const {layouts, activeLayout} = configuration;
        const {layoutChange} = handlers;

        return (
            <fieldset className="keyboard-input-view">
                <select onChange={layoutChange} value={activeLayout}>
                    {layouts.map(layout => <option key={layout.name} value={layout.name}>{layout.name}</option>)}
                </select>
            </fieldset>
        );
    }
}

export default KeyboardInputView;