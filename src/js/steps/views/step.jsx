/*global document, module, require, CustomEvent */
import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";


class Step extends PureComponent {

    static propTypes = {
        "glide": PropTypes.bool,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "levels": PropTypes.number.isRequired,
        "sequencerIndex": PropTypes.number.isRequired,
        "stepIndex": PropTypes.number.isRequired,
        "value": PropTypes.number.isRequired
    }

    @autobind
    handleStepGlideToggle (event) {
        const {
            handlers: {
                stepGlideToggle = () => null
            } = {},
            sequencerIndex,
            stepIndex
        } = this.props;

        stepGlideToggle(sequencerIndex, stepIndex);
        event.stopPropagation();
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

    @autobind
    handleStepDelete (event) {
        const {
            handlers: {
                deleteStep = () => null
            } = {},
            sequencerIndex,
            stepIndex
        } = this.props;

        deleteStep(sequencerIndex, stepIndex);
        event.stopPropagation();
    }

    render () {
        const {
            glide = false,
            levels,
            stepIndex,
            sequencerIndex,
            value = 0
        } = this.props;

        const inputs = [];

        for (let l = levels - 1; l >= 0; l -= 1) {
            inputs.push(
                <label
                    key={[stepIndex, l].join("-")}
                >
                    <span className="label-text">{l}</span>
                    <input
                        checked={l === value}
                        name={["steps", sequencerIndex, "step", stepIndex].join("-")}
                        onChange={this.handleStepValueChange}
                        type="radio"
                        value={l}
                    />
                </label>
            );
        }

        return (
            <fieldset className="step">
                <legend>Step {stepIndex}</legend>
                <div className="flex-wrapper">
                    <button
                        className="step-delete"
                        onClick={this.handleStepDelete}
                        title={"delete step " + stepIndex}
                        type="button"
                    >x</button>
                    {inputs}
                    <label
                        key={[stepIndex, "glide"].join("-")}
                    >
                        <span className="label-text">glide</span>
                        <input
                            checked={glide}
                            name={["steps", sequencerIndex, "step", stepIndex, "glide", "toggle"].join("-")}
                            onChange={this.handleStepGlideToggle}
                            type="checkbox"
                            value="glide"
                        />
                    </label>
                </div>
            </fieldset>
        );
    }
}

export default Step;
