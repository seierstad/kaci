import React, {Component, PropTypes} from "react";
import {polarityShape} from "../../propdefs";

class PolaritySelector extends Component {
    constructor () {
        super();
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange (event) {
        event.stopPropagation();
        event.preventDefault();
        this.props.changeHandler(event.target.value);
    }

    render () {
        const {prefix, patch} = this.props;
        return (
            <div>
                <select id={prefix + "-polarity"} onChange={this.handleChange} value={patch}>
                    {
                        [
                            { value: "positive", label: "+", title: "positive"},
                            { value: "full", label: "±", title: "full"},
                            { value: "negative", label: "-", title: "negative"}
                        ].map((item, i) => <option key={i} title={item.title} value={item.value}>{item.label}</option>)
                    }
                </select>
                <label htmlFor={prefix + "-polarity"}>polarity</label>
            </div>
        );
    }
}
PolaritySelector.propTypes = {
    "changeHandler": PropTypes.func.isRequired,
    "patch": polarityShape.isRequired,
    "prefix": PropTypes.string.isRequired
};

export default PolaritySelector;
