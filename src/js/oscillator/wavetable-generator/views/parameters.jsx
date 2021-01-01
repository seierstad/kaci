import React, {Component} from "react";
import PropTypes from "prop-types";

//import RangeInput from "../../../static-source/views/range-input.jsx";
import Parameter from "./parameter.jsx";

class ParameterTable extends Component {

    static propTypes = {
        "configuration": PropTypes.object.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": PropTypes.object.isRequired,
        "viewState": PropTypes.object.isRequired
    }

    render () {
        const {configuration, viewState, patch, handlers} = this.props;

        return (
            <table className="wavetable-generator-parameters">
                <caption>parameter changes</caption>
                <thead>
                    <tr>
                        <th>parameter</th>
                        <th>value range</th>
                        <th>type</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(configuration).filter(
                        ([, value]) => (
                            Object.prototype.hasOwnProperty.call(value, "wavetableRelevant")
                            && value.wavetableRelevant === true
                        )
                    ).map(([key, value]) => (
                        <Parameter
                            configuration={value}
                            handlers={handlers}
                            key={key}
                            paramName={key}
                            patch={patch}
                            viewState={viewState}
                        />
                    ))}
                </tbody>
            </table>
        );
    }
}

export default ParameterTable;
