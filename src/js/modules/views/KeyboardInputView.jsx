import React, {Component, PropTypes} from "react";

import * as PropDefs from "../../proptype-defs";


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
KeyboardInputView.propTypes = {
    "configuration": PropDefs.keyboard.isRequired,
    "handlers": PropTypes.object.isRequired
};

export default KeyboardInputView;
