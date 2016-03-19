/* global require, module, document */
"use strict";
const ViewUtils = require('./ViewUtils');
const Utils = require('../Utils');

import React, {Component, PropTypes} from "react";
import RangeInput from "./RangeInput.jsx";
import { connect } from "react-redux";
import * as Actions from "../Actions.jsx";

class NoiseViewPresentation extends Component {
    render () {
        let noiseToggle = new ViewUtils.createCheckboxInput({
            "id": "noise",
            dispatchEvent: ".toggle",
            checked: true
        }, null);
        const { patch, settings, onPanInput, onGainInput, onToggle } = this.props;

        return (
            <section>
                <h1>Noise</h1>
                <input type="checkbox" onChange={onToggle} checked={patch.active} />
                <RangeInput 
                    label="Noise gain" 
                    min={settings.gain.min}
                    max={settings.gain.max}
                    step={0.01}
                    onInput={onGainInput}
                    value={patch.gain} />
                <RangeInput 
                    label="Noise pan" 
                    min={settings.pan.min}
                    max={settings.pan.max}
                    step={0.01}
                    onInput={onPanInput}
                    value={patch.pan} />
            </section>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        patch: state.patch.noise,
        settings: state.settings.modulation.target.noise
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onToggle: (event) => {
            dispatch({
                type: Actions.NOISE_TOGGLE
            })
        },
        onPanInput: (event) => {
            const value = parseFloat(event.target.value);
            dispatch({
                type: Actions.NOISE_PAN_CHANGE,
                value
            })
        },
        onGainInput: (event) => {
            const value = parseFloat(event.target.value);
            dispatch({
                type: Actions.NOISE_GAIN_CHANGE,
                value
            })
        }
    }
};

const NoiseView = connect(
    mapStateToProps,
    mapDispatchToProps
)(NoiseViewPresentation);
/*
NoiseViewContainer.contextTypes = {
    store: React.PropTypes.object
};
*/
/*
var NoiseView = function (context, modulationLimits, patch, params) {
    if (!patch) {
        patch = {};
    }
    if (!params) {
        params = {};
    }
    var view, noiseToggle, noiseGain, noisePan;
    this.noiseId = (params && params.noiseId) ? params.noiseId : 'noise';
    var that = this;



    view.appendChild(noiseToggle);

    noiseGain = ViewUtils.createRangeInput({
        label: params.labelGain || "Noise gain",
        container: view,
        min: -1,
        max: 1,
        step: 0.01,
        value: Utils.scale(patch.gain, modulationLimits.gain, {min: -1, max: 1})
    });
    noiseGain.input.addEventListener('input', function (evt) {
        var event = new CustomEvent(that.noiseId + ".change.gain", {
            detail: evt.target.value
        });
        context.dispatchEvent(event);
    });
    view.appendChild(noiseGain.label);
    view.appendChild(noiseGain.input);

    noisePan = ViewUtils.createRangeInput({
        label: params.labelPan || "Noise pan",
        container: view,
        min: -1,
        max: 1,
        step: 0.01,
        value: Utils.scale(patch.pan, modulationLimits.pan, {min: -1, max: 1})
    });
    noisePan.input.addEventListener('input', function (evt) {
        var event = new CustomEvent(that.noiseId + ".change.pan", {
            detail: evt.target.value
        });
        context.dispatchEvent(event);
    });
    view.appendChild(noisePan.label);
    view.appendChild(noisePan.input);

    return view;
};
*/
module.exports = NoiseView;