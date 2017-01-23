import React, {Component} from "react";
import { connect } from "react-redux";

import * as Actions from "../actions";
import {getOffsetElement, cursorPosition, sizeInPixels, getValuePair} from "./ViewUtils";

import SystemSettingsView from "./SystemSettingsView.jsx";
import NoiseView from "./NoiseView.jsx";
import SubView from "./SubView.jsx";
import Envelopes from "./envelope/envelopes.jsx";
import LFOs from "./LFOView.jsx";
import ModulationMatrix from "./modulation/matrix.jsx";
import Oscillator from "./oscillator/oscillator.jsx";
import Keyboard from "./keyboard/keyboard.jsx";


class KaciReactViewPresentation extends Component {

    render () {
        const {configuration, patch, handlers, viewState, playState} = this.props;
        return (
            <div>
                <SystemSettingsView
                    keyboardConfiguration={configuration.keyboard}
                    keyboardHandlers={handlers.keyboard}
                    resetHandler={handlers.systemReset}
                />
                <Oscillator
                    envelopeHandlers={handlers.envelope}
                    viewState={viewState.oscillator}
                />
                <NoiseView
                    configuration={configuration.modulation.target.noise}
                    handlers={handlers.noise}
                    patch={patch.noise}
                />
                <SubView
                    configuration={configuration.modulation.target.sub}
                    handlers={handlers.sub}
                    patch={patch.sub}
                    syncHandlers={handlers.sync}
                />
                <Envelopes
                    configuration={configuration.modulation.source.envelopes}
                    handlers={handlers.envelope}
                    patch={patch.envelopes}
                    viewState={viewState.envelopes}
                />
                <LFOs
                    configuration={configuration.modulation.source.lfos}
                    handlers={handlers.lfos}
                    patch={patch.lfos}
                    syncHandlers={handlers.sync}
                />
                <ModulationMatrix />
                <Keyboard />
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
                    });
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
                durationChange: (module, envelopeIndex, envelopePart, value) => {
                    dispatch({
                        type: Actions.ENVELOPE_DURATION_CHANGE,
                        module,
                        envelopeIndex,
                        envelopePart,
                        value
                    });
                }

            },
            lfos: {
                reset: (event, module, index) => {
                    dispatch({"type": Actions.LFO_RESET, module, index});
                },
                amountChange: (value, module, index) => {
                    dispatch({"type": Actions.LFO_AMOUNT_CHANGE, index, module, value});
                },
                frequencyChange: (value, module, index) => {
                    dispatch({"type": Actions.LFO_FREQUENCY_CHANGE, index, module, value});
                },
                changeWaveform: (value, module, index) => {
                    dispatch({"type": Actions.LFO_WAVEFORM_CHANGE, index, module, value});
                }
            },
            sync: {
                denominatorChange: (value, module, index) => {
                    dispatch({"type": Actions.SYNC_DENOMINATOR_CHANGE, module, index, value});
                },
                numeratorChange: (value, module, index) => {
                    dispatch({"type": Actions.SYNC_NUMERATOR_CHANGE, module, index, value});
                },
                toggle: (module, index) => {
                    dispatch({"type": Actions.SYNC_TOGGLE, module, index});
                }
            },
            noise: {
                toggle: (event) => {
                    dispatch({type: Actions.NOISE_TOGGLE});
                },
                panInput: (value) => {
                    dispatch({type: Actions.NOISE_PAN_CHANGE, value});
                },
                gainInput: (value) => {
                    dispatch({type: Actions.NOISE_GAIN_CHANGE, value});
                }
            },
            keyboard: {
                layoutChange: (event) => {
                    const value = event.target.value;
                    dispatch({type: Actions.KEYBOARD_LAYOUT_CHANGE, value});
                }
            },
            systemReset: () => {
                dispatch({type: Actions.SYSTEM_RESET});
            }
        }
    };
};
const KaciReactView = connect(
    mapStateToProps,
    mapDispatchToProps
)(KaciReactViewPresentation);


export default KaciReactView;
