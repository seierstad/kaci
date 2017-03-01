/*global document, module, require, CustomEvent */
import React, {Component, PropTypes} from "react";

import {morseGeneratorPatchShape, modulationMorseSourcesConfigShape} from "../../propdefs";
import {morseEncode} from "../../shared-functions";

import RangeInput from "../RangeInput.jsx";
import Periodic from "../decorators/periodic.jsx";
import Modulator from "../decorators/modulator.jsx";

import MorseSvg from "./morse-svg.jsx";


class MorseGenerator extends Component {

    static propTypes = {
        "configuration": modulationMorseSourcesConfigShape.isRequired,
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "index": PropTypes.number.isRequired,
        "patch": morseGeneratorPatchShape.isRequired
    }

    constructor () {
        super();
        this.module = "morse";
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSpeedUnitChange = this.handleSpeedUnitChange.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    handleTextChange (event) {
        event.stopPropagation();
        this.props.handlers.textChange(this.module, this.props.index, event.target.value);
    }

    handleSpeedUnitChange (event) {
        event.stopPropagation();
        this.props.handlers.speedUnitChange(this.module, this.props.index, parseInt(event.target.value, 10));
    }

    render () {
        const {index, patch, handlers} = this.props;
        const pattern = morseEncode(patch.text);
        const id = "morse-generator-text-" + index;

        return (
            <section className="morse" id={"morse-" + index + "-view"}>
                <h2>Morse {index + 1}</h2>
                <label><input id={id} onChange={this.handleTextChange} onInput={this.handleTextChange} type="text" value={patch.text} /><span className="label-text">text</span></label>
                <MorseSvg data={pattern} wrap={patch.speedUnit || pattern.length} />
                <label htmlFor={id + "-length"}>pattern length</label>
                <output className="morse-output-length" htmlFor={id} id={id + "-length"}>{pattern.length}</output>
                <input
                    className="speed-reference"
                    id={"morse-speed-unit-" + index}
                    max={pattern.length}
                    min={4}
                    onChange={this.handleSpeedUnitChange}
                    step={1}
                    type="number"
                    value={patch.speedUnit || pattern.length}
                />
                <label htmlFor={"morse-speed-unit-" + index}>Speed unit</label>
                {this.props.children}
            </section>
        );
    }
}


export default Periodic(Modulator(MorseGenerator));
