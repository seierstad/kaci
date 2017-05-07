/*global document, module, require, CustomEvent */
import React, {Component, PropTypes} from "react";

import {morseGeneratorPatchShape, modulationMorseSourcesConfigShape, morseGeneratorViewStateShape} from "../../propdefs";
import {morseEncode, factors, divisors, shiftPattern, padPattern} from "../../shared-functions";

import RangeInput from "../RangeInput.jsx";
import Periodic from "../decorators/periodic.jsx";
import Modulator from "../decorators/modulator.jsx";

import MorseSvg from "./morse-svg.jsx";


class MorseGenerator extends Component {

    static propTypes = {
        "configuration": modulationMorseSourcesConfigShape.isRequired,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "index": PropTypes.number.isRequired,
        "patch": morseGeneratorPatchShape.isRequired,
        "viewState": morseGeneratorViewStateShape
    }

    constructor (props) {
        super(props);
        this.module = "morse";
        const {index} = this.props;
        this.handleTextChange = this.handleTextChange.bind(this, this.module, index);
        this.handleSpeedUnitChange = this.handleSpeedUnitChange.bind(this, this.module, index);
        this.handleGuideToggle = this.handleGuideToggle.bind(this, this.module, index);
        this.handlePaddingChange = this.handlePaddingChange.bind(this, this.module, index);
        this.handleShiftChange = this.handleShiftChange.bind(this, this.module, index);
        this.handleFitToggle = this.handleFitToggle.bind(this, this.module, index);
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch
                || this.props.viewState !== nextProps.viewState;
    }

    handleTextChange (module, index, event) {
        event.stopPropagation();
        this.props.handlers.textChange(module, index, event.target.value);
    }

    handleSpeedUnitChange (module, index, event) {
        event.stopPropagation();
        this.props.handlers.speedUnitChange(module, index, parseInt(event.target.value, 10));
    }

    handlePaddingChange (module, index, event) {
        event.stopPropagation();
        this.props.handlers.paddingChange(module, index, parseInt(event.target.value, 10));
    }

    handleShiftChange (module, index, event) {
        event.stopPropagation();
        this.props.handlers.shiftChange(module, index, parseInt(event.target.value, 10));
    }

    handleFitToggle (module, index, event) {
        event.stopPropagation();
        this.props.handlers.toggleFillToFit(module, index);
    }

    handleGuideToggle (module, index, event) {
        event.stopPropagation();
        this.props.handlers.toggleGuide(module, index, parseInt(event.target.value, 10));
    }

    render () {
        const MAX_GUIDE_DIVISOR = 12;

        const {index, patch, handlers, viewState = {}} = this.props;
        const {guides = []} = viewState;
        const {padding = 0, shift = 0, text = "", fillToFit = false, speedUnit} = patch;
        const pattern = morseEncode(text);
        const remainder = (pattern.length + padding) % speedUnit;
        const fitPadding = (speedUnit && fillToFit && remainder !== 0) ? (speedUnit - remainder) : 0;
        const paddedPattern = padPattern(pattern, padding + fitPadding);
        const shiftedPattern = shiftPattern(paddedPattern, shift);

        const id = "morse-generator-text-" + index;
        const patternDivisors = divisors(speedUnit || pattern.length).filter(f => f < MAX_GUIDE_DIVISOR && f !== 1 && f !== pattern.length).sort((a, b) => a < b);

        const visibleGuides = patternDivisors.filter(d => ~guides.indexOf(d));

        return (
            <section className="morse" id={"morse-" + index + "-view"}>
                <h2>Morse {index + 1}</h2>
                <label><span className="label-text">text</span><input id={id} onChange={this.handleTextChange} onInput={this.handleTextChange} type="text" value={text} /></label>
                <MorseSvg data={shiftedPattern} guides={visibleGuides} wrap={speedUnit || pattern.length} />
                <label htmlFor={id + "-length"}>pattern length</label>
                <output className="morse-output-length" htmlFor={id} id={id + "-length"}>{pattern.length}</output>
                <label htmlFor={"morse-padding-" + index}>
                    <span className="label-text">Padding</span>
                    <input
                        className="padding"
                        id={"morse-padding-" + index}
                        max={pattern.length}
                        min={-pattern.length}
                        onChange={this.handlePaddingChange}
                        step={1}
                        type="number"
                        value={padding || 0}
                    />
                </label>
                <label className="morse-fit-toggle">
                    <input
                        checked={!!fillToFit}
                        onChange={this.handleFitToggle}
                        type="checkbox"
                        value="fit"
                    />
                    <span className="label-text">fit to time unit</span>
                </label>

                <label htmlFor={"morse-shift-" + index}>
                    <span className="label-text">Shift</span>
                    <input
                        className="shift"
                        id={"morse-shift-" + index}
                        max={Math.floor(pattern.length / 2)}
                        min={-Math.floor(pattern.length / 2)}
                        onChange={this.handleShiftChange}
                        step={1}
                        type="number"
                        value={shift || 0}
                    />
                </label>


                <label htmlFor={"morse-speed-unit-" + index}>
                    <span className="label-text">Speed unit</span>
                    <input
                        className="speed-reference"
                        id={"morse-speed-unit-" + index}
                        max={pattern.length}
                        min={4}
                        onChange={this.handleSpeedUnitChange}
                        step={1}
                        type="number"
                        value={speedUnit || pattern.length}
                    />
                </label>
                {(patternDivisors && patternDivisors.length > 0) ? (
                    <fieldset className="morse-pattern-divisor-toggles">
                        <legend>show guides</legend>
                        {patternDivisors.map(divisor => (
                            <label className="morse-guide-toggle" key={divisor}>
                                <input
                                    checked={~guides.indexOf(divisor) ? true : false}
                                    onChange={this.handleGuideToggle}
                                    type="checkbox"
                                    value={divisor}
                                />
                                <span className="label-text">{divisor}</span>
                            </label>
                        ))}
                    </fieldset>
                ) : null}

                {this.props.children}
            </section>
        );
    }
}


export default Periodic(Modulator(MorseGenerator));
