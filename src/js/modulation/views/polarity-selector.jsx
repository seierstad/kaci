import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import {polarityShape} from "../propdefs";


class PolaritySelector extends Component {

    static propTypes = {
        "changeHandler": PropTypes.func.isRequired,
        "patch": polarityShape.isRequired,
        "prefix": PropTypes.string.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    @autobind
    handleChange (event) {
        event.stopPropagation();
        event.preventDefault();
        this.props.changeHandler(event.target.value);
    }

    render () {
        const {prefix, patch} = this.props;
        return (
            <React.Fragment>
                <select className="polarity-selector" id={prefix + "-polarity"} onChange={this.handleChange} value={patch}>
                    {
                        [
                            {value: "positive", label: "+", title: "positive"},
                            {value: "full", label: "±", title: "full"},
                            {value: "negative", label: "-", title: "negative"}
                        ].map((item, i) => <option key={i} title={item.title} value={item.value}>{item.label}</option>)
                    }
                </select>
                <label htmlFor={prefix + "-polarity"}>polarity</label>
            </React.Fragment>
        );
    }
}


export default PolaritySelector;
