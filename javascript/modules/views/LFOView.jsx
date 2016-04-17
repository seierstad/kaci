/*global document, module, require, CustomEvent */
import React, {Component} from "react";
import {connect} from "react-redux";
import * as Actions from "../Actions.jsx";
import RangeInput from "./RangeInput.jsx";
import WaveformSelector from "./WaveformSelector.jsx";
import SyncControls from "./SyncControls.jsx";


class LFOPresentation extends Component {
    render () {
        const {lfoIndex, configuration, patch, onReset, onAmountInput, onFrequencyInput, onSyncToggle, onSyncDenominatorChange, onSyncNumeratorChange} = this.props;
        const amountChangeHandler = onAmountInput(lfoIndex);
        const frequencyChangeHandler = onFrequencyInput(lfoIndex);
        const syncPossible = patch.sync;

        return (
            <section id={"lfo-" + lfoIndex + "-view"} className="lfo">
                <h2><abbr title="low frequency oscillator">LFO</abbr>{lfoIndex + 1}</h2>
                <button onClick={onReset(lfoIndex)}>reset</button>
                <WaveformSelector />
                <RangeInput 
                    label="amount" 
                    min={configuration.amount.min}
                    max={configuration.amount.max}
                    step={configuration.amount.step}
                    onChange={amountChangeHandler}
                    onInput={amountChangeHandler}
                    value={patch.amount}
                />
                <RangeInput 
                    label="frequency"
                    disabled={syncPossible && patch.sync.enabled}
                    min={configuration.frequency.min}
                    max={configuration.frequency.max}
                    step={configuration.frequency.step}
                    onChange={frequencyChangeHandler}
                    onInput={frequencyChangeHandler}
                    value={patch.frequency}
                />
                {syncPossible ?
                    <SyncControls 
                        patch={patch.sync}
                        configuration={configuration.sync}
                        onToggle={onSyncToggle(lfoIndex)}
                        onNumeratorChange={onSyncNumeratorChange(lfoIndex)}
                        onDenominatorChange={onSyncDenominatorChange(lfoIndex)}
                    />
                : null}
            </section>
        );
    }
}
const mapStateToLFOProps = (state) => {
    return {
        configuration: state.settings.modulation.source.lfos
    };
}
const mapDispatchToLFOProps = (dispatch) => {
    return {
        onReset: (lfoIndex) => () => {
            dispatch({"type": Actions.LFO_RESET, lfoIndex});
        },
        onAmountInput: (lfoIndex) => (event) => {
            dispatch({"type": Actions.LFO_AMOUNT_CHANGE, lfoIndex, "value": parseFloat(event.target.value)});
        },
        onFrequencyInput: (lfoIndex) => (event) => {
            dispatch({"type": Actions.LFO_FREQUENCY_CHANGE, lfoIndex, "value": parseFloat(event.target.value)});
        },
        onSyncDenominatorChange: lfoIndex => event => {
            dispatch({"type": Actions.LFO_SYNC_DENOMINATOR_CHANGE, lfoIndex, "value": parseInt(event.target.value, 10)});
        },
        onSyncNumeratorChange: lfoIndex => event => {
            dispatch({"type": Actions.LFO_SYNC_NUMERATOR_CHANGE, lfoIndex, "value": parseInt(event.target.value, 10)});
        },
        onSyncToggle: lfoIndex => _ => {
            dispatch({"type": Actions.LFO_SYNC_TOGGLE, lfoIndex});
        }
    };
}

const LFO = connect(
    mapStateToLFOProps,
    mapDispatchToLFOProps
)(LFOPresentation);


class LFOsPresentation extends Component {
    render () {
        const {patchData, configuration} = this.props;
        let lfos = [];

        for (let i = 0; i < configuration.count; i += 1) {
            let patch = patchData[i] || configuration["default"];
            lfos.push(<LFO key={i} lfoIndex={i} patch={patch} />);
        }

        return <div>{lfos}</div>;
    }
}
const mapStateToLFOsProps = (state) => {
    return {
        patchData: state.patch.lfos,
        configuration: state.settings.modulation.source.lfos
    };
};
const LFOs = connect(
    mapStateToLFOsProps,
    null
)(LFOsPresentation);

export default LFOs;
/*
var LFOView = function (ctx, patch, params) {
    IdealOscillator = require("../IdealOscillator");

    viewOscillator = new IdealOscillator(ctx),

    lfoToggle = new Utils.createCheckboxInput({
        "id": this.lfoId,
        dispatchEvent: ".toggle",
        checked: (patch.active)
    }, ctx);
    lfoView.appendChild(lfoToggle);


    //    lfoView.appendChild(new WaveformSelector(viewOscillator, IdealOscillator.waveforms, "lfo.change.waveform", ctx, this.lfoId + "-waveform", patch.waveform, this.lfoId));
    return lfoView;
};
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