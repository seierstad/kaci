import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import RangeInput from "../../../static-source/views/range-input.jsx";

class Parameter extends Component {

    static propTypes = {
        "configuration": PropTypes.object.isRequired,
        "handlers": PropTypes.object.isRequired,
        "paramName": PropTypes.string.isRequired,
        "patch": PropTypes.object.isRequired,
        "viewState": PropTypes.object.isRequired
    }

    @autobind
    onValueChange (value) {
        this.props.handlers.changeParameter(this.props.paramName, value, this.props.patch);
    }

    @autobind
    handleChangerate (event) {
        event.stopPropagation();
        this.props.handlers.changeChangeRate(this.props.paramName, event.target.value, this.props.patch);
    }

    render () {
        const {
            configuration,
            viewState = {
                parameters: {}
            },
            paramName,
            patch
        } = this.props;

        const {
            patchPath = null,
            ...noResetConfig
        } = configuration;

        const patchValue = (patchPath === null) ? (
            patch[paramName]
        ) : (
            patchPath.reduce((acc, curr) => acc[curr], patch)
        );


        return (
            <tr>
                <td>{paramName}</td>
                <td>
                    <div className="wavetable-generator-parameter-range">
                        <RangeInput
                            changeHandler={() => null}
                            className="wavetable-start-value"
                            configuration={noResetConfig}
                            disabled
                            value={patchValue}
                        />
                        <RangeInput
                            changeHandler={this.onValueChange}
                            className="wavetable-target-value"
                            configuration={noResetConfig}
                            value={viewState.parameters[paramName].value}
                        />
                    </div>
                </td>
                <td>
                    <input
                        checked={viewState.parameters[paramName].change_rate === "lin"}
                        id={"change-rate-" + paramName + "-linear"}
                        key={paramName + "-linear"}
                        name={"change-rate-" + paramName}
                        onChange={this.handleChangerate}
                        type="radio"
                        value="lin"
                    />
                    <label htmlFor={"change-rate-" + paramName + "-linear"} key={paramName + "-linear-label"}>lin</label>
                    <input
                        checked={viewState.parameters[paramName].change_rate === "exp"}
                        id={"change-rate-" + paramName + "-exp"}
                        key={paramName + "-exp"}
                        name={"change-rate-" + paramName}
                        onChange={this.handleChangerate}
                        type="radio"
                        value="exp"
                    />
                    <label htmlFor={"change-rate-" + paramName + "-exp"} key={paramName + "-exp-label"}>exp</label>
                </td>
            </tr>
        );
    }
}

export default Parameter;
