/* global document */
"use strict";
import drawWaveform from './drawWaveform';
import React, {Component} from "react";
import {connect} from "react-redux";
let waveformSelectorCounter = 0;

class WaveformButtonPresentation extends Component {
    render () {
        const {controlName, waveformName} = this.props;
        
        return (
            <label>
                <input type="radio" name={controlName + "selector"} value={waveformName} />
                <br />
                <canvas ref={c => this.canvas = c} width="50px" height="50px" />
            </label>
        );
    }
    componentDidMount() {
        console.log(this.canvas);
    }
}
const mapStateToProps = (state) => {
    return {

    };
}
const WaveformButton = connect(
    mapStateToProps,
    null
)(WaveformButtonPresentation);


export default class WaveformSelector extends Component {
    render () {
        const controlName = "waveform-" + (waveformSelectorCounter++);
        const waveforms = ["a", "b"];
        return (
            <fieldset className="waveform-selector">
                <legend>waveform</legend>
                {waveforms.map(w => <WaveformButton key={w} controlName={controlName} waveformName={w} />)}
            </fieldset>
        );
    }
}
/*
var aWaveformSelector = function (oscillator, waveforms, eventName, eventDispatchObject, controlName, initialValue, id) {
    var parentElement = null, names, waveformSelector, waveformSelectorElement, heading, button, canvas, radio, i;

    names = Object.keys(waveforms);
    var drawer = function (phase) {
        return waveforms[names[i]].call(oscillator, phase);
    };

    for (i = 0; i < names.length; i += 1) {

        drawWaveform(drawer, canvas);

        if (names[i] === initialValue) {
            radio.setAttribute('checked', 'checked');
        }
    }

    waveformSelectorElement.addEventListener('change', function (evt) {
        var data = {
            detail: {
                value: evt.target.value
            }
        };
        if (id) {
            data.detail.id = id;
        }
        var event = new CustomEvent(eventName, data);
        eventDispatchObject.dispatchEvent(event);
    });

    return waveformSelectorElement;
};

*/