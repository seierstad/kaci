/*global document, module, require, CustomEvent */
import React, {Component, PropTypes} from "react";

import {lfoPatchDataShape, modulationLfoSourcesShape} from "../../propdefs";
import {waveforms} from "../../waveforms";

import RangeInput from "../RangeInput.jsx";
import WaveformSelector from "../WaveformSelector.jsx";
import SyncControls from "../SyncControls.jsx";


class LFO extends Component {
    constructor () {
        super();
        this.reset = this.reset.bind(this);
        this.amountChange = this.amountChange.bind(this);
        this.frequencyChange = this.frequencyChange.bind(this);
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    reset (event) {
        const {index, module, handlers} = this.props;
        handlers.reset(event, module, index);
    }

    amountChange (value) {
        const {index, module, handlers} = this.props;
        handlers.amountChange(value, module, index);

    }

    frequencyChange (value) {
        const {index, module, handlers} = this.props;
        handlers.frequencyChange(value, module, index);

    }

    render () {
        const {index, configuration, patch, handlers, syncHandlers} = this.props;
        const syncPossible = patch.sync;

        return (
            <section className="lfo" id={"lfo-" + index + "-view"}>
                <h2><abbr title="low frequency oscillator">LFO</abbr>{index + 1}</h2>
                <button onClick={this.reset}>reset</button>
                <WaveformSelector
                    changeHandler={handlers.changeWaveform}
                    includePhaseIndicator
                    index={index}
                    module="lfos"
                    parameter="waveform"
                    selected={patch.waveform}
                    waveforms={waveforms}
                />
                <RangeInput
                    changeHandler={this.amountChange}
                    configuration={configuration.amount}
                    label="amount"
                    value={patch.amount}
                />
                <RangeInput
                    changeHandler={this.frequencyChange}
                    configuration={configuration.frequency}
                    disabled={syncPossible && patch.sync.enabled}
                    label="frequency"
                    value={patch.frequency}
                />
                {syncPossible ?
                    <SyncControls
                        configuration={configuration.sync}
                        handlers={syncHandlers}
                        index={index}
                        module="lfos"
                        patch={patch.sync}
                    />
                : null}
            </section>
        );
    }
}

LFO.propTypes = {
    "configuration": modulationLfoSourcesShape.isRequired,
    "handlers": PropTypes.objectOf(PropTypes.func),
    "index": PropTypes.number.isRequired,
    "module": PropTypes.string.isRequired,
    "patch": lfoPatchDataShape.isRequired,
    "syncHandlers": PropTypes.object
};


export default LFO;

/*
    lfoToggle = new Utils.createCheckboxInput({
        "id": this.lfoId,
        dispatchEvent: ".toggle",
        checked: (patch.active)
    }, ctx);
    lfoView.appendChild(lfoToggle);
*/

/*

    if (params.syncControls && patch.syncEnabled) {
        lfoRate.input.disabled = true;
    }


    var lfoRateMonitor = document.createElement("div");
    if (typeof lfoRateMonitor === "function") {

        var blinkAnimation = function blinkAnimation(element, frequency, states, easing) {
            if (typeof element.animate === "function") {
                var animation = element.animate(states || [{
                    backgroundColor: "blue"
                }, {
                    backgroundColor: "red"
                }], {
                    duration: 1000 / frequency,
                    iterations: Infinity,
                    delay: 0,
                    easing: easing || "step-middle"
                });
                element.addEventListener("animationiteration", function (event) {
                    console.dir(event);
                });
                return animation;
            }
        };

        lfoRateMonitor.setAttribute("class", "blink");
        lfoView.appendChild(lfoRateMonitor);

        var lfoRateAnimation = blinkAnimation(lfoRateMonitor, lfoRate.input.value);

        var synchronizeAnimation = function synchronizeAnimation(freq) {
            //        lfo.oscillator.requestZeroPhaseEvent(that.lfoId + ".zeroPhase");
            ctx.addEventListener(that.lfoId + ".zeroPhase", function () {
                ctx.removeEventListener(that.lfoId + ".zeroPhase");
                lfoRateAnimation = blinkAnimation(lfoRateMonitor, freq || lfoRate.input.value);
            });
        };

        var startAnimation = function startAnimation() {
            if (lfoRateAnimation) {
                lfoRateAnimation.cancel();
                lfoRateAnimation = blinkAnimation(lfoRateMonitor, lfoRate.input.value);
                lfoRateAnimation.addEventListener("finish", function () {
                    synchronizeAnimation();
                });
            } else {
                synchronizeAnimation();
            }
        };

        lfoRate.input.addEventListener("input", function () {
            startAnimation();
        });
        synchronizeAnimation();

        var frequencyChangeHandler = function frequencyChangeHandler(event) {
            if (event.detail.id === that.lfoId) {
                synchronizeAnimation(event.detail.value);
            }
        };
        ctx.addEventListener("lfo.changed.frequency", frequencyChangeHandler);
    }

*/
