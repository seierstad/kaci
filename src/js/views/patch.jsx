import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";

import * as Actions from "../actions";
import {patchShape, viewStateShape, configurationShape} from "../propdefs";

import {getValuePair} from "./ViewUtils";

import NoiseView from "./NoiseView.jsx";
import SubView from "./SubView.jsx";
import Envelopes from "./envelope/envelopes.jsx";
import LFOs from "./lfo/lfos.jsx";
import MorseGenerators from "./morse/morse-generators.jsx";
import ModulationMatrix from "./modulation/matrix.jsx";
import Oscillator from "./oscillator/oscillator.jsx";
import MainOutput from "./main-output.jsx";

class PatchPresentation extends Component {

    static propTypes = {
        "configuration": configurationShape.isRequired,
        "handlers": PropTypes.object.isRequired,
        "patch": patchShape.isRequired,
        "viewState": viewStateShape.isRequired
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.patch !== this.props.patch
                || nextProps.viewState !== this.props.viewState;
    }

    render () {
        const {configuration, patch, handlers, viewState} = this.props;
        const {target, source} = configuration.modulation;

        return (
            <div>
                <MainOutput
                    configuration={target.main}
                    handlers={handlers.main}
                    patch={patch.main}
                />
                <Oscillator
                    configuration={target.oscillator}
                    envelopeHandlers={handlers.envelope}
                    patch={patch.oscillator}
                    viewState={viewState.oscillator}
                />
                <NoiseView
                    configuration={target.noise}
                    handlers={handlers.noise}
                    patch={patch.noise}
                />
                <SubView
                    configuration={target.sub}
                    handlers={handlers.sub}
                    patch={patch.sub}
                    syncHandlers={handlers.periodic.sync}
                />
                <Envelopes
                    configuration={source.envelope}
                    handlers={handlers.envelope}
                    patch={patch.envelopes}
                    viewState={viewState.envelopes}
                />
                <LFOs
                    configuration={source.lfo}
                    handlers={{...handlers.modulator, ...handlers.periodic, ...handlers.lfo}}
                    patch={patch.lfos}
                />
                <MorseGenerators
                    configuration={source.morse}
                    handlers={{...handlers.modulator, ...handlers.periodic, ...handlers.morse}}
                    patch={patch.morse}
                    viewState={viewState.morse}
                />
                <ModulationMatrix
                    configuration={configuration.modulation}
                    patch={patch.modulation}
                />
            </div>
        );
    }
}


const mapDispatchToProps = (dispatch) => ({
    "handlers": {
        "envelope": {
            "circleClick": (event, module, envelopeIndex, envelopePart, index, first, last) => {
                if (event.shiftKey) {
                    dispatch({
                        type: Actions.ENVELOPE_POINT_DELETE,
                        module,
                        envelopeIndex,
                        envelopePart,
                        index
                    });
                } else {
                    if ((envelopePart === "sustain") || (envelopePart === "release" && first) || envelopePart === "attack" && last) {
                        dispatch({type: Actions.ENVELOPE_SUSTAIN_EDIT_START, module, envelopeIndex});
                    } else {
                        dispatch({type: Actions.ENVELOPE_POINT_EDIT_START, module, envelopeIndex, envelopePart, index});
                    }
                }
            },
            "mouseOut": (event, module, envelopeIndex, envelopePart) => {
                const pos = getValuePair(event, event.currentTarget);
                if (pos.x > 1 || pos.x < 0 || pos.y > 1 || pos.y < 0) {
                    if (envelopePart === "sustain") {
                        dispatch({type: Actions.ENVELOPE_SUSTAIN_EDIT_END, module, envelopeIndex});
                    } else {
                        dispatch({type: Actions.ENVELOPE_BLUR, module, envelopeIndex, envelopePart});
                    }
                }
            },
            "activeCircleMouseUp": (event, module, envelopeIndex, envelopePart, index) => {
                dispatch({
                    type: Actions.ENVELOPE_POINT_EDIT_END,
                    module,
                    envelopeIndex,
                    envelopePart,
                    index
                });
            },
            "circleBlur": (event, module, envelopeIndex, envelopePart, index, first, last) => {
                if ((envelopePart === "sustain") || (envelopePart === "release" && last) || envelopePart === "attack" && first) {
                    dispatch({type: Actions.ENVELOPE_SUSTAIN_EDIT_END, module, envelopeIndex});
                } else {
                    dispatch({type: Actions.ENVELOPE_POINT_EDIT_END, module, envelopeIndex, envelopePart, index});
                }
            },
            "backgroundClick": (event, module, steps, envelopeIndex, envelopePart) => {
                const {x, y} = getValuePair(event, event.target);
                const index = steps.findIndex(e => e[0] > x);

                dispatch({type: Actions.ENVELOPE_POINT_ADD, module, envelopeIndex, envelopePart, index, x, y});
            },
            "sustainBackgroundClick": (event, module, envelopeIndex) => {
                const {y} = getValuePair(event, event.target);
                dispatch({type: Actions.ENVELOPE_SUSTAIN_CHANGE, module, envelopeIndex, value: y});
            },
            "circleMouseDrag": (event, module, envelopeIndex, envelopePart, background, index, first, last) => {
                const {x, y} = getValuePair(event, background);

                if ((envelopePart === "sustain") || (envelopePart === "release" && first) || (envelopePart === "attack" && last)) {

                    dispatch({
                        type: Actions.ENVELOPE_SUSTAIN_CHANGE,
                        module,
                        envelopeIndex,
                        envelopePart,
                        value: y
                    });
                } else {
                    dispatch({type: Actions.ENVELOPE_POINT_CHANGE, module, envelopeIndex, envelopePart, index, x, y});
                }
            },
            "durationChange": (module, envelopeIndex, envelopePart, value) => {
                dispatch({
                    type: Actions.ENVELOPE_DURATION_CHANGE,
                    module,
                    envelopeIndex,
                    envelopePart,
                    value
                });
            }

        },
        "modulator": {
            "reset": (event, module, index) => {
                dispatch({"type": Actions.MODULATOR_RESET, module, index});
            },
            "amountChange": (value, module, index) => {
                dispatch({"type": Actions.MODULATOR_AMOUNT_CHANGE, index, module, value});
            }
        },
        "lfo": {
            "changeWaveform": (value, module, index) => {
                dispatch({"type": Actions.LFO_WAVEFORM_CHANGE, index, module, value});
            }
        },
        "morse": {
            "speedUnitChange": (module, index, value) => {
                dispatch({"type": Actions.MORSE_SPEED_UNIT_CHANGE, module, index, value});
            },
            "paddingChange": (module, index, value) => {
                dispatch({"type": Actions.MORSE_PADDING_CHANGE, module, index, value});
            },
            "shiftChange": (module, index, value) => {
                dispatch({"type": Actions.MORSE_SHIFT_CHANGE, module, index, value});
            },
            "toggleFillToFit": (module, index, value) => {
                dispatch({"type": Actions.MORSE_FILL_TOGGLE, module, index, value});
            },
            "textChange": (module, index, value) => {
                dispatch({"type": Actions.MORSE_TEXT_CHANGE, module, index, value});
            },
            "toggleGuide": (module, index, value) => {
                dispatch({"type": Actions.MORSE_GUIDE_TOGGLE, module, index, value});
            }
        },
        "periodic": {
            "frequencyChange": (value, module, index) => {
                dispatch({"type": Actions.MODULATOR_FREQUENCY_CHANGE, index, module, value});
            },
            "sync": {
                "denominatorChange": (value, module, index) => {
                    dispatch({"type": Actions.SYNC_DENOMINATOR_CHANGE, module, index, value});
                },
                "numeratorChange": (value, module, index) => {
                    dispatch({"type": Actions.SYNC_NUMERATOR_CHANGE, module, index, value});
                },
                "toggle": (module, index) => {
                    dispatch({"type": Actions.SYNC_TOGGLE, module, index});
                }
            }
        },
        "noise": {
            "outputHandlers": {
                "handleToggle": () => {
                    dispatch({type: Actions.OUTPUT_TOGGLE, module: "noise"});
                },
                "handlePanInput": (value) => {
                    dispatch({type: Actions.OUTPUT_PAN_CHANGE, value, module: "noise"});
                },
                "handleGainInput": (value) => {
                    dispatch({type: Actions.OUTPUT_GAIN_CHANGE, value, module: "noise"});
                }
            },
            "colorChange": (value) => {
                dispatch({type: Actions.NOISE_COLOR_CHANGE, value});
            }
        },
        "main": {
            "outputHandlers": {
                "handleToggle": () => {
                    dispatch({type: Actions.OUTPUT_TOGGLE, module: "main"});
                },
                "handlePanInput": (value) => {
                    dispatch({type: Actions.OUTPUT_PAN_CHANGE, value, module: "main"});
                },
                "handleGainInput": (value) => {
                    dispatch({type: Actions.OUTPUT_GAIN_CHANGE, value, module: "main"});
                }
            }
        }
    }
});

const Patch = connect(null, mapDispatchToProps)(PatchPresentation);


export default Patch;
