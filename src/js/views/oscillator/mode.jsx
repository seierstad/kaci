import React, {Component, PropTypes} from "react";

import {oscillatorModeShape} from "../../propdefs";
import {OSCILLATOR_MODE} from "../../constants";

const MODES = [];
for (const m in OSCILLATOR_MODE) {
    if (OSCILLATOR_MODE.hasOwnProperty(m)) {
        MODES.push(OSCILLATOR_MODE[m]);
    }
}

class Mode extends Component {

    static propTypes = {
        "children": PropTypes.any.isRequired,
        "handler": PropTypes.func.isRequired,
        "patch": oscillatorModeShape.isRequired
    }

    constructor () {
        super();
        this.handleChange = this.handleChange.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return (
            this.props.patch !== nextProps.patch
            || this.props.children !== nextProps.children
        );
    }

    handleChange (event) {
        event.stopPropagation();
        this.props.handler(event.target.value);
    }

    render () {
        const {patch} = this.props;

        return (
            <fieldset>
                <legend>mode</legend>
                {MODES.reduce((acc, mode) => {
                    return [
                        ...acc,
                        <input
                            checked={patch === mode}
                            id={"oscillator-mode-" + mode}
                            key={mode + "-input"}
                            name="oscillator-mode"
                            onChange={this.handleChange}
                            type="radio"
                            value={mode}
                        />,
                        <label htmlFor={"oscillator-mode-" + mode} key={mode + "-label"}>{mode}</label>
                    ];
                }, [])}
                {this.props.children}
            </fieldset>
        );
    }
}


export default Mode;
