import React, {Component, PropTypes} from "react";
import {polarityShape} from "../../propdefs";

class PolaritySelector extends Component {
    render () {
        const {changeHandler, prefix, patch} = this.props;
        return (
            <div>
                <select id={prefix + "-polarity"} onChange={changeHandler} value={patch}>
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
