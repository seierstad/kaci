/*global document, module, require, CustomEvent */
import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {boundMethod} from "autobind-decorator";

import Modulator from "../../modulator/views/modulator.jsx";
import Periodic from "../../periodic/views/periodic.jsx";
import {stepsPatchShape} from "../propdefs";
import Step from "./step.jsx";
import SequenceGenerator from "./sequence-generator.jsx";
import Glide from "./glide-view.jsx";

class StepSequencerView extends PureComponent {

    static propTypes = {
        "children": PropTypes.any,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "index": PropTypes.number.isRequired,
        "patch": stepsPatchShape.isRequired,
        "viewState": PropTypes.object
    }

    constructor (props) {
        super(props);
        //this.grid = null;
        this.module = "steps";
    }

    @boundMethod
    handleAddStep (event) {
        const {
            index,
            handlers: {
                addStep
            } = {}
        } = this.props;

        addStep(index);
    }

    @boundMethod
    handleIncreaseLevelCount (event) {
        const {
            index,
            handlers: {
                increaseLevelCount
            } = {}
        } = this.props;

        increaseLevelCount(index);
    }

    @boundMethod
    handleDecreaseLevelCount (event) {
        const {
            index,
            handlers: {
                decreaseLevelCount
            } = {}
        } = this.props;

        decreaseLevelCount(index);
    }

    @boundMethod
    handleGenerateSequence (generatorFunctionName, generatorFunctionParameters = {}, normalize) {
        const {
            index,
            handlers: {
                generateSequence
            } = {}
        } = this.props;

        generateSequence(index, generatorFunctionName, generatorFunctionParameters, normalize);
    }

    @boundMethod
    handleSelectGenerator (generatorName) {
        const {
            index,
            handlers: {
                selectGenerator
            } = {}
        } = this.props;

        selectGenerator(index, generatorName);
    }

    @boundMethod
    handleReverse (event) {
        event.stopPropagation();
        event.preventDefault();

        const {
            index,
            handlers: {
                reverse
            } = {}
        } = this.props;

        reverse(index);
    }

    @boundMethod
    handleInvertValues (event) {
        event.stopPropagation();
        event.preventDefault();

        const {
            index,
            handlers: {
                invertValues
            } = {}
        } = this.props;

        invertValues(index);
    }

    @boundMethod
    shiftSequence (shift) {
        const {
            index,
            handlers: {
                sequenceShift
            } = {}
        } = this.props;

        sequenceShift(index, shift);
    }

    @boundMethod
    handleShiftLeft () {
        this.shiftSequence(-1);
    }

    @boundMethod
    handleShiftRight () {
        this.shiftSequence(1);
    }

    render () {
        const {index, patch, handlers, syncHandlers, configuration, viewState = {}} = this.props;
        const {
            maxValue,
            sequence = [],
            sync: syncPossible
        }= patch;

        return (
            <section className="steps" id={"steps-" + index + "-view"}>
                <h2>Steps {index + 1}</h2>
                <SequenceGenerator
                    onSelect={this.handleSelectGenerator}
                    onSubmit={this.handleGenerateSequence}
                    viewState={viewState}
                />
                <div className="steps-grid">
                    {sequence.map((step, stepIndex) => (
                        <Step
                            glide={step.glide}
                            handlers={handlers}
                            key={[stepIndex, step.glide, step.value].join("-")}
                            maxValue={maxValue}
                            sequencerIndex={index}
                            stepIndex={stepIndex}
                            value={step.value}
                        />
                    ))}
                    <button
                        className="steps-sequence-button step-add"
                        onClick={this.handleAddStep}
                        title="add step"
                        type="button"
                    >add</button>
                    <button
                        className="steps-sequence-button levels-increase"
                        onClick={this.handleIncreaseLevelCount}
                        title="increase level count"
                        type="button"
                    >+</button>
                    <button
                        className="steps-sequence-button levels-decrease"
                        onClick={this.handleDecreaseLevelCount}
                        title="decrease level count"
                        type="button"
                    >-</button>
                    <button
                        className="steps-sequence-button invert-values"
                        onClick={this.handleInvertValues}
                        title="invert values"
                        type="button"
                    >inv</button>
                    <button
                        className="steps-sequence-button reverse"
                        onClick={this.handleReverse}
                        title="reverse sequence"
                        type="button"
                    >rev</button>
                    <button
                        className="steps-sequence-button shift left"
                        onClick={this.handleShiftLeft}
                        title="shift sequence left"
                        type="button"
                    >◀</button>
                    <button
                        className="steps-sequence-button shift right"
                        onClick={this.handleShiftRight}
                        title="shift sequence right"
                        type="button"
                    >▶</button>
                </div>
                <Glide
                    configuration={configuration.glide}
                    handlers={handlers.glide}
                    index={index}
                    patch={patch.glide}
                />
                {this.props.children}
            </section>
        );
    }
}


export default Modulator(Periodic(StepSequencerView));
