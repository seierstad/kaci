import React, {Component} from "react";
import PropTypes from "prop-types";
import {boundMethod} from "autobind-decorator";

import {divisors} from "../../shared-functions";

import Periodic from "../../periodic/views/periodic.jsx";
import Modulator from "../../modulator/views/modulator.jsx";
import {
    morseConfigShape,
    morseGeneratorPatchShape,
    morseGeneratorViewStateShape
} from "../propdefs";
//import {presetQuotes} from "../defaults";
import {morseEncode, getSequence} from "../functions";

import MorseSvg from "./morse-svg.jsx";


class MorseGenerator extends Component {

    static propTypes = {
        "children": PropTypes.any,
        "configuration": morseConfigShape.isRequired,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "index": PropTypes.number.isRequired,
        "patch": morseGeneratorPatchShape.isRequired,
        "viewState": morseGeneratorViewStateShape
    }

    constructor (props) {
        super(props);
        const {index} = this.props;
        this.index = index;
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch
                || this.props.viewState !== nextProps.viewState;
    }

    @boundMethod
    handleTextChange (event) {
        const {
            index,
            handlers
        } = this.props;

        event.stopPropagation();
        handlers.textChange(event.target.value, index);
    }

    @boundMethod
    handleSpeedUnitChange (event) {
        const {
            index,
            handlers
        } = this.props;

        event.stopPropagation();
        handlers.speedUnitChange(parseInt(event.target.value, 10), index);
    }

    @boundMethod
    handlePaddingChange (event) {
        const {
            index,
            handlers
        } = this.props;

        event.stopPropagation();
        handlers.paddingChange(parseInt(event.target.value, 10), index);
    }

    @boundMethod
    handleShiftChange (event) {
        const {
            index,
            handlers
        } = this.props;

        event.stopPropagation();
        handlers.shiftChange(parseInt(event.target.value, 10), index);
    }

    @boundMethod
    handleFitToggle (event) {
        const {
            index,
            handlers
        } = this.props;

        event.stopPropagation();
        handlers.toggleFillToFit(module, index);
    }

    @boundMethod
    handleGuideToggle (event) {
        const {
            index,
            handlers
        } = this.props;

        event.stopPropagation();
        handlers.toggleGuide(parseInt(event.target.value, 10), index);
    }

    render () {
        const MAX_GUIDE_DIVISOR = 12;

        const {index, patch, viewState = {}} = this.props;
        const {guides = []} = viewState;
        const {text = "", shift, speed: {speedUnit}, fillToFit, padding} = patch;
        const pattern = morseEncode(text);
        const shiftedPaddedPattern = getSequence(patch);

        const id = "morse-generator-text-" + index;
        const patternDivisors = divisors(speedUnit || pattern.length)
            .filter(f => f < MAX_GUIDE_DIVISOR && f !== 1 && f !== pattern.length)
            .sort((a, b) => a < b ? -1 : 1);

        const quotesListId = `morse-${index}-quotes`;
        const visibleGuides = patternDivisors.filter(d => ~guides.indexOf(d));

        return (
            <section className="morse" id={"morse-" + index + "-view"}>
                <h1>Morse {index + 1}</h1>
                <label>
                    <span className="label-text">text</span>
                    <input
                        id={id}
                        list={quotesListId}
                        onChange={this.handleTextChange}
                        onInput={this.handleTextChange}
                        value={text}
                    />
                </label>
                {/*
                <datalist id={quotesListId}>
                    {presetQuotes.map(q => (
                        <option key={q} value={q} />
                    ))}
                </datalist>
                */}
                <MorseSvg data={shiftedPaddedPattern} guides={visibleGuides} wrap={speedUnit || pattern.length} />
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
