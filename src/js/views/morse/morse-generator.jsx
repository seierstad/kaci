/*global document, module, require, CustomEvent */
import React, {Component, PropTypes} from "react";

import {morseGeneratorPatchShape, modulationMorseSourcesConfigShape} from "../../propdefs";

import RangeInput from "../RangeInput.jsx";
import Periodic from "../decorators/periodic.jsx";
import Modulator from "../decorators/modulator.jsx";


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
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    handleTextChange (event) {
        event.stopPropagation();
        this.props.handlers.textChange(this.module, this.props.index, event.target.value);
    }

    render () {
        const {index, patch, handlers} = this.props;

        const id = "morse-generator-text-" + index;

        return (
            <section className="morse" id={"morse-" + index + "-view"}>
                <h2>Morse {index + 1}</h2>
                <label><input id={id} onChange={this.handleTextChange} onInput={this.handleTextChange} type="text" value={patch.text} /><span className="label-text">text</span></label>
                <output className="morse-output" from={id} value={patch.text} />
                {this.props.children}
            </section>
        );
    }
}


export default Periodic(Modulator(MorseGenerator));
