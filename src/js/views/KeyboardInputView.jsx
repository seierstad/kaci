import React, {Component} from "react"; import PropTypes from "prop-types";

import {keyboardConfigShape} from "../propdefs";


class KeyboardInputView extends Component {

    static propTypes = {
        "configuration": keyboardConfigShape.isRequired,
        "handlers": PropTypes.object.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return (this.props.configuration !== nextProps.configuration);
    }

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
