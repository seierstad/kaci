/*global document, module, require, CustomEvent */
import React, {Component} from "react";
import PropTypes from "prop-types";
import autobind from "autobind-decorator";

import RangeInput from "../../static-source/views/range-input.jsx";

import Modulator from "../../modulator/views/modulator.jsx";
import Periodic from "../../periodic/views/periodic.jsx";
import {stepsPatchShape} from "../propdefs";
import Step from "./step.jsx";


class StepSequencerView extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "index": PropTypes.number.isRequired,
        "patch": stepsPatchShape.isRequired
    }

    constructor (props) {
        super(props);
        this.grid = null;
        this.module = "steps";
    }

    /*
    componentDidMount () {
        this.phaseIndicator = this.waveformSelector.phaseIndicator;
        this.updatePhaseIndicator(true);
    }
    */

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    /*
    componentDidUpdate (prevProps, prevState) {
        this.phaseIndicator = this.grid.phaseIndicator;
        this.updatePhaseIndicator(true);
    }
    */

    @autobind
    updatePhaseIndicator (time, phase) {
        this.phaseIndicator.style.animationDuration = (1000 / this.props.patch.frequency) + "ms";
    }

    @autobind
    handleAddStep (event) {
        const {
            index,
            handlers: {
                addStep
            } = {}
        } = this.props;

        addStep(index);
    }

    @autobind
    handleIncreaseLevelCount (event) {
        const {
            index,
            handlers: {
                increaseLevelCount
            } = {}
        } = this.props;

        increaseLevelCount(index);
    }

    @autobind
    handleDecreaseLevelCount (event) {
        const {
            index,
            handlers: {
                decreaseLevelCount
            } = {}
        } = this.props;

        decreaseLevelCount(index);
    }

    @autobind
    handleGlideChange (value) {
        const {
            index,
            handlers: {
                changeGlide
            } = {}
        } = this.props;

        changeGlide(index, value);
    }

    render () {
        const {index, patch, handlers, syncHandlers, configuration} = this.props;
        const syncPossible = patch.sync;
        const steps = [];

        for (let s = 0; s < patch.steps.length; s += 1) {
            steps.push(
                <Step
                    glide={patch.steps[s].glide}
                    handlers={handlers}
                    key={["steps", index, s].join("-")}
                    levels={patch.levels}
                    sequencerIndex={index}
                    stepIndex={s}
                    value={patch.steps[s].value}
                />
            );
        }

        return (
            <section className="steps" id={"steps-" + index + "-view"}>
                <h2>Steps {index + 1}</h2>
                <div className="steps-grid">
                    {steps}
                    <button className="step-add" onClick={this.handleAddStep} title="add step" type="button">add</button>
                    <button className="levels-increase" onClick={this.handleIncreaseLevelCount} title="increase level count" type="button">+</button>
                    <button className="levels-decrease" onClick={this.handleDecreaseLevelCount} title="decrease level count" type="button">-</button>
                </div>
                <RangeInput
                    changeHandler={this.handleGlideChange}
                    configuration={configuration.glide}
                    label="glide"
                    value={patch.glide}
                />
                {this.props.children}
            </section>
        );
    }
}


export default Modulator(Periodic(StepSequencerView));
