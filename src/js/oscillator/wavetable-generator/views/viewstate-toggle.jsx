import React, {Component} from "react";
import PropTypes from "prop-types";


class ViewstateToggle extends Component {

    static propTypes = {
        "active": PropTypes.bool,
        "handler": PropTypes.func.isRequired
    }

    render () {
        const {active, handler} = this.props;

        return (
            <label className="function-active">
                <input checked={!!active} onChange={handler} type="checkbox" />
                <span className="label-text">active</span>
            </label>
        );
    }
}


export default ViewstateToggle;
