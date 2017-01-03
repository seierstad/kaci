import React, {Component} from "react";
import { connect } from "react-redux";

import * as Actions from "../Actions.jsx";
import {getOffsetElement, cursorPosition, sizeInPixels, getValuePair} from "./ViewUtils";

import SystemSettingsView from "./SystemSettingsView.jsx";
import NoiseView from "./NoiseView.jsx";
import SubView from "./SubView.jsx";
import Envelopes from "./EnvelopeView.jsx";
import LFOs from "./LFOView.jsx";
import ModulationMatrix from "./ModulationMatrixView.jsx";
import Oscillator from "./OscillatorView.jsx";
import Keyboard from "./KeyboardView.jsx";


class KaciReactViewPresentation extends Component {

    render () {
        const {configuration, patch, handlers, viewState, playState} = this.props;
        return (
            <div>
                <SystemSettingsView
                    midiHandlers={handlers.midi}
                    midiConfiguration={configuration.midi}
                    keyboardConfiguration={configuration.keyboard}
                    keyboardHandlers={handlers.keyboard} />
                <Oscillator
                    patch={patch.oscillator}
                    handlers={handlers.oscillator}
                    envelopeHandlers={handlers.envelope}
                    configuration={configuration.modulation.target.oscillator}
                    viewState={viewState.oscillator}
                    />
                <NoiseView
                    patch={patch.noise}
                    handlers={handlers.noise}
                    configuration={configuration.modulation.target.noise} />
                <SubView
                    patch={patch.sub}
                    handlers={handlers.sub}
                    configuration={configuration.modulation.target.sub} />
                <Envelopes
                    patch={patch.envelopes}
                    handlers={handlers.envelope}
                    configuration={configuration.modulation.source.envelopes}
                    viewState={viewState.envelopes}
                    />
                <LFOs
                    patch={patch.lfos}
                    handlers={handlers.lfos}
                    syncHandlers={handlers.sync}
                    configuration={configuration.modulation.source.lfos}
                    />
                <ModulationMatrix
                    patch={patch.modulation}
                    handlers={handlers.modulation}
                    configuration={configuration.modulation}
                    />
                <Keyboard
                    handlers={handlers.keyboard}
                    playState={playState}
                    configuration={configuration.keyboard}
                    />
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    configuration: state.settings,
    patch: state.patch,
    viewState: state.viewState,
    playState: state.playState

});
const mapDispatchToProps = (dispatch) => {
    return {
        handlers: {
            midi: {
                portChange: (event) => {
                    const value = event.target.value;
                    dispatch({type: Actions.MIDI_PORT_SELECT, value});
                }
            },
            oscillator: {
                resonance: {
                    factorChange: (event) => {
                        const value = parseFloat(event.target.value);
                        dispatch({type: Actions.OSCILLATOR_RESONANCE_FACTOR_CHANGE, value});
                    },
                    wrapperChange: (event, module) => {
                        dispatch({"type": Actions.OSCILLATOR_WRAPPER_CHANGE, "value": event.target.value});
                    },
                    toggle: () => {
                        dispatch({"type": Actions.OSCILLATOR_RESONANCE_TOGGLE});
                    }
                },
                waveformChange: (event, module) => {
                    dispatch({"type": Actions.OSCILLATOR_WAVEFORM_CHANGE, "value": event.target.value});
                },
                mix: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({"type": Actions.OSCILLATOR_MIX_CHANGE, value});
                },
                detune: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({"type": Actions.OSCILLATOR_DETUNE_CHANGE, value});
                }
             },
            envelope: {
                circleClick: (event, module, envelopeIndex, envelopePart, index, first, last) => {
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
                mouseOut: (event, module, envelopeIndex, envelopePart) => {
                    const pos = getValuePair(event, event.currentTarget);
                    if (pos.x > 1 || pos.x < 0 || pos.y > 1 || pos.y < 0) {
                        if (envelopePart === "sustain") {
                            dispatch({type: Actions.ENVELOPE_SUSTAIN_EDIT_END, module, envelopeIndex});
                        } else {
                            dispatch({type: Actions.ENVELOPE_BLUR, module, envelopeIndex, envelopePart});
                        }
                    }
                },
                activeCircleMouseUp: (event, module, envelopeIndex, envelopePart, index) => {
                    dispatch({
                        type: Actions.ENVELOPE_POINT_EDIT_END,
                        module,
                        envelopeIndex,
                        envelopePart,
                        index
                    })
                },
                circleBlur: (event, module, envelopeIndex, envelopePart, index, first, last) => {
                    if ((envelopePart === "sustain") || (envelopePart === "release" && first) || envelopePart === "attack" && first) {
                        dispatch({type: Actions.ENVELOPE_SUSTAIN_EDIT_END, module, envelopeIndex});
                    } else {
                        dispatch({type: Actions.ENVELOPE_POINT_EDIT_END, module, envelopeIndex, envelopePart, index});
                    }
                },
                backgroundClick: (event, module, steps, envelopeIndex, envelopePart) => {
                    const {x, y} = getValuePair(event, event.target);
                    const index = steps.findIndex(e => e[0] > x);

                    dispatch({type: Actions.ENVELOPE_POINT_ADD, module, envelopeIndex, envelopePart, index, x, y});
                },
                sustainBackgroundClick: (event, module, envelopeIndex) => {
                    const {x, y} = getValuePair(event, event.target);
                    dispatch({type: Actions.ENVELOPE_SUSTAIN_CHANGE, module, envelopeIndex, value: y});
                },
                circleMouseDrag: (event, module, envelopeIndex, envelopePart, background, index, first, last) => {
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
                durationChange: (event, module, envelopeIndex, envelopePart) => {
                    dispatch({
                        type: Actions.ENVELOPE_DURATION_CHANGE,
                        module,
                        envelopeIndex,
                        envelopePart,
                        value: parseFloat(event.target.value)
                    })
                }

            },
            lfos: {
                reset: (event, module, index) => {
                    dispatch({"type": Actions.LFO_RESET, module, index});
                },
                amountChange: (event, module, index) => {
                    dispatch({"type": Actions.LFO_AMOUNT_CHANGE, index, module, "value": parseFloat(event.target.value)});
                },
                frequencyChange: (event, module, index) => {
                    dispatch({"type": Actions.LFO_FREQUENCY_CHANGE, index, module, "value": parseFloat(event.target.value)});
                },
                changeWaveform: (event, module, index) => {
                    dispatch({"type": Actions.LFO_WAVEFORM_CHANGE, index, module, "value": event.target.value});
                }
            },
            sync: {
                denominatorChange: (event, module, index) => {
                    dispatch({"type": Actions.SYNC_DENOMINATOR_CHANGE, module, index, "value": parseInt(event.target.value, 10)});
                },
                numeratorChange: (event, module, index) => {
                    dispatch({"type": Actions.SYNC_NUMERATOR_CHANGE, module, index, "value": parseInt(event.target.value, 10)});
                },
                toggle: (event, module, index) => {
                    dispatch({"type": Actions.SYNC_TOGGLE, module, index});
                }
            },
            sub: {
                toggle: (event) => {
                    dispatch({type: Actions.SUB_TOGGLE});
                },
                panInput: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({type: Actions.SUB_PAN_CHANGE, value});
                },
                gainInput: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({type: Actions.SUB_GAIN_CHANGE, value});
                },
                depthChange: (event) => {
                    const value = parseInt(event.target.value, 10);
                    dispatch({type: Actions.SUB_DEPTH_CHANGE, value});
                }
            },
            noise: {
                toggle: (event) => {
                    dispatch({type: Actions.NOISE_TOGGLE});
                },
                panInput: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({type: Actions.NOISE_PAN_CHANGE, value});
                },
                gainInput: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({type: Actions.NOISE_GAIN_CHANGE, value});
                }
            },
            modulation: {
                amountChange: (event, sourceType, index, module, parameter) => {
                    dispatch({"type": Actions.MODULATION_AMOUNT_CHANGE, sourceType, index, module, parameter, value: parseFloat(event.target.value)});
                },
                polarityChange: (event, sourceType, index, module, parameter) => {
                    dispatch({"type": Actions.MODULATION_POLARITY_CHANGE, sourceType, index, module, parameter, value: event.target.value});
                },
                toggle: (event, sourceType, index, module, parameter) => {
                    dispatch({"type": Actions.MODULATION_CONNECTION_TOGGLE, sourceType, index, module, parameter});
                }
            },
            keyboard: {
                layoutChange: (event) => {
                    const value = event.target.value;
                    dispatch({type: Actions.KEYBOARD_LAYOUT_CHANGE, value});
                },
                pitchShift: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({"type": Actions.KEYBOARD_PITCH_SHIFT}, value);
                },
                chordShift: (event) => {
                    const value = parseFloat(event.target.value);
                    dispatch({"type": Actions.KEYBOARD_CHORD_SHIFT}, value);
                },
                key: {
                    down: (event, keyNumber) => {
                        dispatch({"type": Actions.KEYBOARD_KEY_DOWN, keyNumber});
                    },
                    up: (event, keyNumber) => {
                        dispatch({"type": Actions.KEYBOARD_KEY_UP, keyNumber});
                    }
                }
            }
        }
    };
};
const KaciReactView = connect(
    mapStateToProps,
    mapDispatchToProps
)(KaciReactViewPresentation);


export default KaciReactView;
