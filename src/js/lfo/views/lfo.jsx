/*global document, module, require, CustomEvent */
import React, {Component} from "react";
import PropTypes from "prop-types";
import {boundMethod} from "autobind-decorator";

import WaveformSelector from "../../waveform/views/waveform-selector.jsx";
import {waveforms} from "../../waveform/waveforms";
import Modulator from "../../modulator/views/modulator.jsx";
import Periodic from "../../periodic/views/periodic.jsx";
import {lfoPatchShape} from "../propdefs";


class LFO extends Component {

    static propTypes = {
        "handlers": PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
        "index": PropTypes.number.isRequired,
        "patch": lfoPatchShape.isRequired
    }

    constructor (props) {
        super(props);
        this.waveformSelector = React.createRef();
        this.waveforms = {};
        this.module = "lfos";
    }

    componentWillMount () {
        for (const w in waveforms) {
            this.waveforms[w] = waveforms[w]();
        }
    }

    componentDidMount () {
        this.phaseIndicator = this.waveformSelector.current.phaseIndicator.current;
        this.updatePhaseIndicator(true);
    }

    shouldComponentUpdate (nextProps) {
        return this.props.patch !== nextProps.patch;
    }

    componentDidUpdate () {
        this.phaseIndicator = this.waveformSelector.current.phaseIndicator.current;
        this.updatePhaseIndicator(true);
    }

    @boundMethod
    onWaveformChange (waveformName) {
        const {
            handlers: {
                changeWaveform
            },
            index
        } = this.props;
        changeWaveform("lfos", index, waveformName);
    }

    @boundMethod
    updatePhaseIndicator () {
        this.phaseIndicator.style.animationDuration = (1000 / this.props.patch.frequency) + "ms";
    }

    render () {
        const {index, patch, handlers, syncHandlers} = this.props;
        const syncPossible = patch.sync;

        return (
            <section className="lfo" id={"lfo-" + index + "-view"}>
                <h2><abbr title="low frequency oscillator">LFO</abbr>{index + 1}</h2>
                <WaveformSelector
                    changeHandler={this.onWaveformChange}
                    includePhaseIndicator
                    index={index}
                    module={this.module}
                    parameter="waveform"
                    ref={this.waveformSelector}
                    selected={patch.waveform}
                    waveforms={this.waveforms}
                />
                {this.props.children}
            </section>
        );
    }
}


export default Modulator(Periodic(LFO));

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
