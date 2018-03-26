/*global document, module, require, CustomEvent */
import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";


class Step extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "levels": PropTypes.number.isRequired,
        "sequencerIndex": PropTypes.number.isRequired,
        "stepIndex": PropTypes.number.isRequired,
        "value": PropTypes.number.isRequired
    }

    @autobind
    handleStepValueChange (event) {
        const {
            handlers: {
                stepValueChange = () => null
            } = {},
            sequencerIndex,
            stepIndex
        } = this.props;

        stepValueChange(sequencerIndex, stepIndex, parseFloat(event.target.value, 10));
        event.stopPropagation();
    }

    render () {
        const {
            handlers = {},
            levels,
            stepIndex,
            sequencerIndex,
            value = 0
        } = this.props;

        const inputs = [];

        for (let l = levels - 1; l >= 0; l -= 1) {
            inputs.push(
                <input
                    checked={l === value}
                    key={[stepIndex, l].join("-")}
                    name={["steps", sequencerIndex, "step", stepIndex].join("-")}
                    onChange={this.handleStepValueChange}
                    type="radio"
                    value={l}
                />
            );
        }

        return (
            <fieldset className="step">
                <legend>Step {stepIndex}</legend>
                <div className="flex-wrapper">
                    {inputs}
                </div>
            </fieldset>
        );
    }
}

export default Step;
